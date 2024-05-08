const Post = require("../models/postModel");
const User = require("../models/userModel");
const path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");
const HttpError = require("../models/errorModel");

const express = require('express');
const app = express();

const { mongoose } = require('mongoose');

// Set up Multer 
const multer  = require('multer');
const upload = require("../utils/multer");



//CallCloudinary//
const cloudinary = require("../utils/cloudinary");


///////////////      CREATE POST         ///////////////////

const createPost = async (req, res, next) => {
  try {
    let { title, category, description } = req.body;
    if (!title || !category || !description || !req.file) {
      return next(new HttpError("Fill in all fields and choose a thumbnail", 422));
    }

    
    // Check file size
    if ( thumbnail = req.file.size > 2000000) {
      return next(new HttpError("Thumbnail too big, Max is 2Mb"));
    }

    // Upload thumbnail to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(req.file.path);

    if (!cloudinaryResult.secure_url) {
      return next(new HttpError("Error uploading thumbnail to Cloudinary", 500));
    }

    // Create new post with the Cloudinary URL
    const newPost = await Post.create({
      title,
      category,
      description,
      thumbnail: cloudinaryResult.secure_url,
      creator: req.user.id,
    });

    // Increment post count for the current user
    //find user and increase post count
    const currentUser = await User.findById(req.user.id);
    const userPostCount = currentUser.posts + 1;
    await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });


    res.status(201).json(newPost);
  } catch (error) {
    return next(new HttpError(error));
  }
};



//============== GET ALL POST ==================
//POST: api/posts
//UNPROTECTED
const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ updatedAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    return next(new HttpError(error));
  }
};



//============== GET SINGLE POST ==================
//GET: api/posts/:id
//UNPROTECTED
const getPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return next(new HttpError("Post not found", 404));
    }
    res.status(200).json(post);
  } catch (error) {
    return next(new HttpError(error));
  }
};



//============== GET POSTS BY CATEGORY ==================
//GET: api/posts/categories/:category
//UNPROTECTED
const getCatPosts = async (req, res, next) => {
  try {
    const { category } = req.params;
    const catPosts = await Post.find({ category }).sort({ createdAt: -1 });
    res.status(200).json(catPosts);
  } catch (error) {}
};



//============== GET AUTHOR POST ==================
//GET: api/posts/users/:id
//UNPROTECTED
const getUserPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const posts = await Post.find({ creator: id }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    return next(new HttpError(error));
  }
};



//============== EDIT POST ==================
//PATCH: api/posts/:id
//PROTECTED
const editPost = async (req, res, next) => {
  try {
    console.log("trying to EDIT")
    const postId = req.params.id;
    const { title, category, description } = req.body;

    console.log("trying to EDIT2")
    // Check if title, category, and description are provided
    // if (!title || !category || description.length < 12) {
      
    //   return next(new HttpError("Fill in all fields"), 422);
    // }

    console.log("trying to find post")
    // Find the old post from the database
    const oldPost = await Post.findById(postId);
    if (!oldPost) {
      return next(new HttpError("Post not found", 404));
    }

    console.log("finish finding")
    console.log("req file",req.file)
    // Check if the current user is the creator of the post
    if (req.user.id == oldPost.creator.toString()) {

      console.log("if user  is ownber of pic")
      let updatedPost;
  
      if (!req.file ) {
        // If no new thumbnail is provided, update post without changing the thumbnail
          console.log("updating whout pic")
        updatedPost = await Post.findByIdAndUpdate(
          postId,
          { title, category, description },
          { new: true }
        );
      } else {
        // Delete old thumbnail from Cloudinary
        await cloudinary.uploader.destroy(oldPost.thumbnail);
  
        // Upload new thumbnail to Cloudinary
        //const { thumbnail } = req.file;
        //console.log("thumbnail", thumbnail)
        const cloudinaryResult = await cloudinary.uploader.upload(req.file.path);
        
        console.log("trying to", cloudinaryResult)
        // Create new post with the updated Cloudinary URL
        updatedPost = await Post.findByIdAndUpdate(
          postId,
          {
            title,
            category,
            description,
            thumbnail: cloudinaryResult.secure_url,
          },
          { new: true }
        );
      }
      
      // Return updated post
      res.status(200).json(updatedPost);
      
    }else{
      return next(new HttpError("You are not authorized to edit this post.", 403));
    }
    
  } catch (error) {
    return next(new HttpError(error));
  }
};


//============== DELETE POST ==================
//DELETE: api/posts/:id
//PROTECTED
const removePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    if (!postId) {
      return next(new HttpError("Post Unavailable"), 400);
    }
    
    const post = await Post.findById(postId);
    const fileName = post?.thumbnail;

    if (!post) {
      return next(new HttpError("Post not found", 404));
    }

    if (req.user.id !== post.creator) {
      
       // Delete image from Cloudinary
    await cloudinary.uploader.destroy(fileName);

    // Delete post from MongoDB
    await Post.findByIdAndDelete(postId);

    // Decrement post count for the current user
    const currentUser = await User.findById(req.user.id);
    const userPostCount = currentUser?.posts - 1;
    await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });

    res.json(`Post ${postId} and associated image deleted successfully.`);
      
      
    }else{
      return next(new HttpError("You are not authorized to delete this post.", 403));
    }

  } catch (error) {
    return next(new HttpError(error));
  }
}


module.exports = {
  createPost,
  getPosts,
  getPost,
  getCatPosts,
  getUserPosts,
  editPost,
  removePost,
};
