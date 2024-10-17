const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./Routes/Users');
const adminRoutes = require('./Routes/Admin');
const pdfFind = require('./Models/PDF')
const path = require('path')

dotenv.config();

app.use(cors({origin: '*'})) // app.use(middleware) - middleware funtioon - all to all requrest - *
app.use(express.json()) //when json data received - parse all jsson data to javascritp object to use here
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set('view engine', 'ejs')// ejs is embedded javascript - server side template send from server to front end 


// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Simple test route
app.get('/', (req, res) => {
  res.send('API is working');
});

app.delete('/api/delete-collection', async (req, res) => {
  const { collectionName } = req.body;

  if (!collectionName) {
      return res.status(400).send('Collection name is required');
  }

  try {
      // Get a reference to the collection
      const collection = mongoose.connection.collection(collectionName);

      // Drop the collection
      await collection.drop();
      res.status(200).send(`Collection '${collectionName}' deleted successfully`);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error deleting collection: ' + error.message);
  }
});

app.get('/api/collections', async (req, res) => {
  try {
      // Get the list of collections
      const collections = await pdfFind.find()

    

      res.status(200).json(collections);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving collections: ' + error.message);
  }
});

// Define routes
app.use('/', authRoutes);
app.use('/api', adminRoutes);
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
