const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:8080' // Replace with your frontend URL
}));

app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://navya2000v:5QYtY04Ch02p73Qb@plant.dexcs.mongodb.net/plantDB?retryWrites=true&w=majority', {
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Define the schema for the plant
const plantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  species: {
    type: String,
    required: true,
    trim: true
  },
  lastWatered: {
    type: Date,
    default: Date.now
  },
  wateringFrequency: {
    type: Number, // in days
    required: true
  },
  careInstructions: {
    type: String,
    required: true,
    maxlength: 500
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Export the schema as a model
const Plant = mongoose.model('Plant', plantSchema);

// Random plants data
const plants = [
  { name: 'Pineapple', species: 'Ananas comosus', wateringFrequency: 14, careInstructions: 'Water every 14 days. Keep in direct sunlight.' },
  { name: 'Strawberry', species: 'Fragaria', wateringFrequency: 3, careInstructions: 'Water every 3 days. Keep in a humid environment.' },
  { name: 'Sunflower', species: 'Helianthus annuus', wateringFrequency: 10, careInstructions: 'Water every 10 days. Keep in direct sunlight.' },
  { name: 'Mint', species: 'Mentha', wateringFrequency: 7, careInstructions: 'Water every 7 days. Keep in indirect sunlight.' },
  { name: 'Marigold', species: 'Tagetes patula', wateringFrequency: 21, careInstructions: 'Water every 21 days. Low light tolerance.' },
  { name: 'Lilly', species: 'Lilium', wateringFrequency: 5, careInstructions: 'Water every 5 days. Bright, indirect sunlight.' },
  { name: 'Grapes', species: 'Vitis vinifera', wateringFrequency: 7, careInstructions: 'Water every 7 days. Keep in indirect sunlight.' },
  { name: 'Cactus', species: 'Cactaceae', wateringFrequency: 2, careInstructions: 'Water every 2 days. Keep in a well-lit area.' },
];

// Function to insert plant data into the database
async function insertPlants() {
  try {
    const existingPlants = await Plant.countDocuments(); // Check if plants are already in the database
    if (existingPlants === 0) {
      await Plant.insertMany(plants); // Insert the random plant data if the collection is empty
      console.log('Plants inserted into the database!');
    } else {
      console.log('Plants already exist in the database!');
    }
  } catch (err) {
    console.error('Error inserting plants:', err);
  }
}

// Call insertPlants function when the server starts
insertPlants();

// API routes

// Get all plants
app.get('/api/plants', async (req, res) => {
  try {
    const plants = await Plant.find(); // Fetch all plants
    res.status(200).json(plants); // Return all plant data
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle server errors
  }
});

// Get a specific plant by name
app.get('/api/plants/:name', async (req, res) => {
  try {
    const plant = await Plant.findOne({ name: req.params.name });
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }
    res.status(200).json(plant);
  } catch (err) {
    console.error('Error fetching plant:', err);
    res.status(500).send('Server error');
  }
});

// Update last watered date for a plant
app.put('/api/plants/:name/water', async (req, res) => {
  try {
    const plantName = req.params.name;
    const plant = await Plant.findOne({ name: plantName });
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }
    
    // Update last watered date
    plant.lastWatered = Date.now();
    await plant.save(); // Save the updated plant
    res.status(200).json(plant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
