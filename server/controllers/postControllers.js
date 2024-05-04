const Post = require("../models/postModel");
const User = require("../models/userModel");
const path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");
const HttpError = require("../models/errorModel");
const { mongoose } = require('mongoose')


// const createPost = async (req, res, next) => {
//   try {
//     let { title, category, description } = req.body;
//     if (!title || !category || !description || !req.files) {
//       return next(
//         new HttpError("Fill in all fields and choose a thumbnail", 422)
//       );
//     }

//     const { thumbnail } = req.files;

//     //Check file size
//     if (thumbnail.size > 2000000) {
//       return next(new HttpError(" Thumbnail too big, Max is 2Mb"));
//     }

//     let fileName = thumbnail.name;
//     let splittedFilename = fileName.split(".");
//     let newFilename =
//       splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1];
//     thumbnail.mv(path.join(__dirname, "..", "/uploads", newFilename), async (err) => {
//         if (err) {
//           return next(new HttpError(err));
//         } else {
//           const newPost = await Post.create({title, category, description, thumbnail: newFilename, creator: req.user.id,});
//           if (!newPost) {
//             return next(new HttpError("Post couldn't be created", 422));
//           }

//           //find user and increase post count
//           const currentUser = await User.findById(req.user.id);
//           const userPostCount = currentUser.posts + 1;
//           await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });

//           res.status(201).json(newPost);
//         }
//       }
//     );
//   } catch (error) {
//     return next(new HttpError(error));
//   }
// };



const multer = require ('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads')); // Destination folder
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, uuid() + ext); // Unique filename using UUID
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 } // Limiting file size to 2MB
}).single('thumbnail');
const createPost = async (req, res, next) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        return next(new HttpError(err.message, 422)); // Handle multer errors
      }
      const { title, category, description } = req.body;
      if (!title || !category || !description || !req.file) {
        return next(new HttpError('Fill in all fields and choose a thumbnail', 422));
      }
      const { file: thumbnail } = req;
      // Create new post
      const newPost = await Post.create({
        title,
        category,
        description,
        thumbnail: thumbnail.filename,
        creator: req.user.id
      });
      if (!newPost) {
        return next(new HttpError('Post couldn\'t be created', 422));
      }
      // Find user and increase post count
      const currentUser = await User.findById(req.user.id);
      const userPostCount = currentUser.posts + 1;
      await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
      res.status(201).json(newPost);
    });
  } catch (error) {
    return next(new HttpError(error.message, 500)); // Handle other errors
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
 
    let fileName;
    let newFilename;
    let updatedPost;
    try { const postId = req.params.id;
    let { title, category, description } = req.body;

    //ReactQuill has a paragraph opening and closing tag with a break tag in between so there are 11 chars in already.

    if (!title || !category || description.length < 12) {
      return next(new HttpError("Fill in all fields"), 422);
    }

    //get oldPost from database
    const oldPost = await Post.findById(postId);
    if (req.user.id == oldPost.creator) {
      if (!req.files) {
        updatedPost = await Post.findByIdAndUpdate(
          postId,
          { title, category, description },
          { new: true }
        );
      } else {
        //delete old thumbnail from upload
        fs.unlink(
          path.join(__dirname, "..", "uploads", oldPost.thumbnail),
          async (err) => {
            if (err) {
              return next(new HttpError(err));
            }
          }
        );
        //upload new thumbnail
        const { thumbnail } = req.files;

        //check file size
        if (thumbnail.size > 2000000) {
          return next(new HttpError("Thumbnail too big, Max is 2Mb"));
        }

        fileName = thumbnail.name;
        let splittedFilename = fileName.split(".");
        newFilename =
          splittedFilename[0] +
          uuid() +
          "." +
          splittedFilename[splittedFilename.length - 1];
        thumbnail.mv(
          path.join(__dirname, "..", "uploads", newFilename),
          async (err) => {
            if (err) {
              return next(new HttpError(err));
            }
          }
        );
        updatedPost = await Post.findByIdAndUpdate(
          postId,
          { title, category, description, thumbnail: newFilename },
          { new: true }
        );
      }
    }
    //File upload completed, update post
    if (!updatedPost) {
      return next(new HttpError("Couldn't update post", 400));
    }

    res.status(200).json(updatedPost);
  } catch (error) {
      return next(new HttpError(error))
  }
}


//============== DELETE POST ==================
//DELETE: api/posts/:id
//PROTECTED
const removePost = async (req, res, next) => {

    const postId = req.params.id;
    if (!postId) {
      return next(new HttpError("Post Unavailable"), 400);
    }
    const post = await Post.findById(postId);
    const fileName = post?.thumbnail;

    if (req.user.id == post.creator) {
      //delete thumbnail from uploads folder
      fs.unlink(path.join(__dirname, "..", "uploads", fileName), async (err) => {
          if (err) {
            return next(err);
          } else {
            await Post.findByIdAndDelete(postId);
            //find user and reduce post count by 1
            const currentUser = await User.findById(req.user.id);
            const userPostCount = currentUser?.posts - 1;
            await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
            res.json(`Post ${postId} deleted successfully.`);
          }
        })
    } else {
        return next(new HttpError("Couldn't delete post.", 403))
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
