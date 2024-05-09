const bcrypt = require ('bcryptjs')
const jwt = require ('jsonwebtoken')
const fs = require ('fs')
const path = require('path')
const {v4: uuid} = require ('uuid')

const User = require ('../models/userModel')
const HttpError = require("../models/errorModel");

const multer  = require('multer');
const uploadwMulter = require("../utils/multer");
const cloudinary = require("../utils/cloudinary")

/////////////    REGISTER NEW USER             ////////////
//=======================================================//
const registerUser = async (req,res, next) => {
  try{
    const {name, email, password, password2} = req.body;
    if(!name || !email || !password) {
      return next(new HttpError("Fill in all the fields",422))
    }

    const newEmail = email.toLowerCase()

    const emailExists = await User.findOne({email: newEmail})
    if(emailExists) {
      return next(new HttpError("Email already exists",422))
    }
    if((password.trim()).length < 6) {
      return next(new HttpError("Password should be at least 6 characters",422))
    }
    if((password != password2)){
      return next (new HttpError("Passwords do not match",422))
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPass = await bcrypt.hash(password, salt);
    const newUser = await User.create({name, email: newEmail, password: hashedPass})
    res.status(201).json(`New user ${newUser.email} registered`)
  }
  catch (error){
    return next (new HttpError ("User Registration Failed", 422))
  }
}


/////////////    LOGIN USER                    ////////////
//=======================================================//

const loginUser = async (req,res, next) => {
  try {
    const {email,password} = req.body;
    console.log("email",email)
    if(!email || !password) {
      return next(new HttpError("Fill in all fields", 422))
    }
    const newEmail = email.toLowerCase();
    
    const user = await User.findOne({email:newEmail})
    console.log("user:", user)
    if (!user) {
      return next(new HttpError("Invalid credentials",422))
    }
    console.log("password:", password)
    const comparePass = await bcrypt.compare(password, user.password)
    if(!comparePass) {
      return next(new HttpError("Wrong Password",422))
    }


    const {_id: id, name} = user;
    const token = jwt.sign({id,name}, process.env.JWT_SECRET, {expiresIn:"1d"})

    res.status(200).json({token,id,name})

  } catch (error) {
    return next (new HttpError ( "Login Failed. Check credentials",422))
    
  }
}


/////////////    GET LOGIN USER                    ////////////
//=======================================================//


const getUser = async (req,res, next) => {
  try {
      const {id} = req.params;
      const user = await User.findById(id).select(`-password`);
      if(!user) {
        return next(new HttpError("User not found", 404))
      }
      res.status(200).json(user);
    } catch (error) {
      return next(new HttpError(error))
  }
}


/////////////    CHANGE AVATAR                   ////////////
//=======================================================  //
const changeAvatar = async (req, res, next) => {
  try {
    
    // Check if avatar file is provided
    // if (!req.files || !req.files.avatar)
    if (!req.file || !req.file.filename) {
      console.log("reg file at change avatar",req.file);
      return next(new HttpError("Please upload an image", 422));
    }
    // Find the user in the database
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new HttpError("User not found", 404));
    }
    console.log("Finding User Avatar ID", user)
    // Delete old avatar from Cloudinary if exists
    if (user.avatar) {
      await cloudinary.uploader.destroy(user.avatar);
    }

    const  avatar  = req.file
   
    // Check avatar size
    if (!avatar.size || avatar.size > 500000) {
      console.log("Avatarsize", avatar.size)
      return next(new HttpError("File upload exceeds 500kb limit"), 422);
    }

    console.log("checking file size",avatar.size);

    // Upload new avatar to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(req.file.path);

    console.log("uploading avatar to cloudinary",cloudinaryResult);

    // Update user with new avatar URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: cloudinaryResult.secure_url },
      { new: true }
    );
      console.log("updated USer Success", updatedUser)
    if (!updatedUser) {
      return next(new HttpError("Avatar couldn't be changed", 422));
    }

    // Return updated user
    res.status(200).json(updatedUser);

  } catch (error) {
    return next(new HttpError(error));
  }
};



/////////////    EDIT USER PROFILE                   ////////////
//=======================================================  //

const editUser = async (req,res, next) => {
  try {
    const {name, email, currentPassword, newPassword, confirmNewPassword} = req.body;
    if(!name || !email || !currentPassword || !newPassword){
      return next (new HttpError("Fill in all the fields", 422))
    }
    console.log("req file at edit user :",req.body)
    const user = await User.findById(req.user.id);
    if(!user){
      return next (new HttpError ("User not found",403))
    }

    const emailExist = await User.findOne({email});
    if (emailExist && (emailExist._id != req.user.id)) {
      return next (new HttpError ("Email already exist", 422))
    }

    const validateUserPassword = await bcrypt.compare(currentPassword, user.password);
    if(!validateUserPassword) {
      return next(new HttpError ("Invalid current password", 422))
    }

    if (newPassword !== confirmNewPassword){
      return next (new HttpError ("New Password does not match", 422))
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(newPassword, salt)

    const newInfo = await User.findByIdAndUpdate(req.user.id, {name,email, password:hash}, {new:true})
    res.status(200).json(newInfo)

  } catch (error) {
    return next (new HttpError (error))
  }
}

const getAuthors = async(req, res,next) =>{
  try {
    const authors = await User.find().select('-password');
    res.json(authors);
  } catch (error) {
    return next (new HttpError(error))

  }
}

module.exports = {registerUser, loginUser, getAuthors,getUser,changeAvatar, editUser}