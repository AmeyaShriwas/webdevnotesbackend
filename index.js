const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const authRoutes = require('./Routes/Users')
const adminRoutes = require('./Routes/Admin')
const ContactUs = require('./Models/ContactUsModel')

dotenv.config()

const allowedOrigins = ['http://localhost:3000', 'https://ameyashriwas.in'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      // If the origin is not in the allowedOrigins array, return an error
      return callback(new Error('Not allowed by CORS'));
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true // If you need to allow credentials
}));
app.use(express.json())

// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

app.get('/', async(req, resp)=> {
    resp.send('api is working')
})



app.use('/', authRoutes)
app.use('/api', adminRoutes)

app.listen(process.env.PORT, ()=> {
    console.log(`connected to port, ${process.env.PORT}`)
})
