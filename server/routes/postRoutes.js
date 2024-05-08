const { Router } = require("express");
const router = Router();
const authMiddleware = require('../middleware/authMiddleware')

const {createPost, getPost,getPosts,getCatPosts,getUserPosts,editPost,removePost } = require("../controllers/postControllers")

///////////////////////////
const upload = require("../utils/multer");


router.post('/',upload.single('thumbnail'),authMiddleware, createPost)
router.get('/', getPosts)
router.get('/:id', getPost)
router.get('/categories/:category',getCatPosts)
router.get('/users/:id',getUserPosts)
router.patch('/:id',upload.single('thumbnail'), authMiddleware, editPost)
router.delete('/:id', authMiddleware, removePost)

module.exports = router;
