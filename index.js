const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./Routes/Users');
const adminRoutes = require('./Routes/Admin');

dotenv.config();

app.use(cors({origin: '*'}))

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
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
