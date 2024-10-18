const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./Routes/Users');
const adminRoutes = require('./Routes/Admin');
const path = require('path')

dotenv.config();

// CORS configuration
const allowedOrigins = [
  'https://dashboard.ameyashriwas.in',
  'https://ameyashriwas.in',
  '*'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Simple test route
app.get('/', (req, res) => {
  res.send('API is working');
});

// Endpoint to delete a collection (first find, then delete)
app.delete('/api/delete-collection', async (req, res) => {
  const { collectionName } = req.body;

  if (!collectionName) {
    return res.status(400).send('Collection name is required');
  }

  try {
    // Check if the collection exists
    const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();
    
    if (collections.length === 0) {
      return res.status(404).send(`Collection '${collectionName}' not found`);
    }

    // Collection found, proceed to delete
    await mongoose.connection.collection(collectionName).drop();
    res.status(200).send(`Collection '${collectionName}' deleted successfully`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting collection: ' + error.message);
  }
});

// API to get all collections
app.get('/api/collections', async (req, res) => {
  try {
    // Retrieve all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    // Extract only collection names to return
    const collectionNames = collections.map(collection => collection.name);

    res.status(200).json(collectionNames);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving collections: ' + error.message);
  }
});

// Define routes
app.use('/', authRoutes);
app.use('/api', adminRoutes);

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
