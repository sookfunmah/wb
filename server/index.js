const express = require ('express')
const cors = require ('cors')
const {connect} = require ('mongoose')
//require('dotenv').config()

const upload = require ('express-fileupload')
const {notFound, errorHandler} = require ('./middleware/errorMiddleware')

const userRoutes = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes')

const app = express();
app.use(express.json({extended:true}))
app.use(express.urlencoded({extended:true}))
//app.use(cors({credentials:true, origin: "http://localhost:3000"}))

const corsOptions = {
    origin: 'https://wbfront-qfxzbl7l8-sook-funs-projects.vercel.app',
    credentials: true // Enable credentials (e.g., cookies) in cross-origin requests
};
app.use(cors(corsOptions));


app.use(upload())
app.use('/uploads', express.static(__dirname + '/uploads'))

app.use('/api/users',userRoutes)
app.use('/api/posts',postRoutes)

app.use(notFound)
app.use(errorHandler)

connect(process.env.MONGO_URL).then(app.listen(process.env.PORT || 5000, () => console.log(`server running on port ${process.env.PORT}`))).catch(error => {console.log(error)})
