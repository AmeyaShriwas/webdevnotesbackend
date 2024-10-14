const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const authRoutes = require('./Routes/Users')
const adminRoutes = require('./Routes/Admin')
const ContactUs = require('./Models/ContactUsModel')

dotenv.config()

app.use(cors({origin: '*'}))
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
