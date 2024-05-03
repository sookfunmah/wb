const express = require ('express')
const cors = require ('cors')
const {connect} = require ('mongoose')
require('dotenv').config()

const upload = require ('express-fileupload')
const {notFound, errorHandler} = require ('./middleware/errorMiddleware')

const userRoutes = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes')

const app = express();

// CORS configuration
const allowedOrigins = [
    'https://yourfrontenddomain.com',
    'http://localhost:3000' // Allow requests from your local development environment
  ];
  
  app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  }));



app.use(express.json({extended:true}))
app.use(express.urlencoded({extended:true}))
// app.use(cors({credentials:true, origin: "http://localhost:3000"}))




app.use(upload())
app.use('/uploads', express.static(__dirname + '/uploads'))

app.use('/api/users',userRoutes)
app.use('/api/posts',postRoutes)

app.use(notFound)
app.use(errorHandler)

connect(process.env.MONGO_URL).then(app.listen(process.env.PORT || 5000, () => console.log(`server running on port ${process.env.PORT}`))).catch(error => {console.log(error)})
