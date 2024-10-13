const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const authRoutes = require('./Routes/Users')
const adminRoutes = require('./Routes/Admin')

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

app.delete('/delete-collection/:collectionName', async (req, res) => {
  const { collectionName } = req.params;

  try {
      const db = mongoose.connection.db;
      const result = await db.dropCollection(collectionName);

      if (result) {
          return res.status(200).json({ message: `${collectionName} collection deleted successfully.` });
      } else {
          return res.status(404).json({ message: `Collection ${collectionName} not found.` });
      }
  } catch (error) {
      if (error.code === 26) {
          return res.status(404).json({ message: `Collection ${collectionName} does not exist.` });
      } else {
          return res.status(500).json({ message: `Error deleting collection: ${error.message}` });
      }
  }
});

app.use('/', authRoutes)

app.listen(process.env.PORT, ()=> {
    console.log(`connected to port, ${process.env.PORT}`)
})
