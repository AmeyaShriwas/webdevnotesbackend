const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./Routes/Users');
const adminRoutes = require('./Routes/Admin');

dotenv.config();

// List of allowed origins
const allowedOrigins = ['http://localhost:3000', 'https://ameyashriwas.in'];

// Updated CORS configuration to handle preflight requests
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin, like mobile apps or Postman
    if (!origin) return callback(null, true);

    // Check if the request's origin is in the allowed origins array
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Not allowed by CORS'));
    }

    // If the origin is allowed, continue
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  optionsSuccessStatus: 200, // Ensure preflight requests return status 200
}));

app.use(express.json());

// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Simple test route
app.get('/', (req, res) => {
  res.send('API is working');
});

// Define routes
app.use('/', authRoutes);
app.use('/api', adminRoutes);

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
