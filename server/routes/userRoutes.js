const {Router} = require('express')
const upload = require("express-fileupload");
const {registerUser, loginUser, getAuthors,getUser,changeAvatar, editUser} = require ("../controllers/userControllers")

const authMiddleware = require ('../middleware/authMiddleware')

const router = Router()
const uploadwMulter = require("../utils/multer");


router.post('/register', registerUser)
router.post('/login',upload(), loginUser)
router.get('/:id',getUser)
router.get('/', getAuthors)
router.post('/change-avatar',uploadwMulter.single("avatar"), authMiddleware, changeAvatar)
router.patch('/edit-user',upload(), authMiddleware, editUser)

module.exports = router