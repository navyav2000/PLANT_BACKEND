const http = require('http');
const mongoose = require('mongoose');
const url = require('url');
const querystring = require('querystring');

// MongoDB connection
mongoose.connect('mongodb+srv://navya2000v:5QYtY04Ch02p73Qb@plant.dexcs.mongodb.net/plantDB?retryWrites=true&w=majority', {
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Define the schema for the plant
const plantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  species: { type: String, required: true, trim: true },
  lastWatered: { type: Date, default: Date.now },
  wateringFrequency: { type: Number, required: true },
  careInstructions: { type: String, required: true, maxlength: 500 },
}, { timestamps: true });

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

// Insert plant data into the database if not present
async function insertPlants() {
  try {
    const existingPlants = await Plant.countDocuments();
    if (existingPlants === 0) {
      await Plant.insertMany(plants);
      console.log('Plants inserted into the database!');
    } else {
      console.log('Plants already exist in the database!');
    }
  } catch (err) {
    console.error('Error inserting plants:', err);
  }
}
insertPlants();

// Utility function for sending JSON responses
function sendJsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;

  // Handle CORS preflight requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

// Get car details by name
if (method === 'GET' && parsedUrl.pathname.startsWith('/api/plants/')) {
  const plantName = parsedUrl.pathname.split('/').pop();

  try {
    const plant = await Plant.findOne({ name: plantName });
    console.log(plant);

    if (plant) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(plant));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Plant not found' }));
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: err.message }));
  }

  return;
}

// Default route
res.writeHead(404, { 'Content-Type': 'application/json' });
res.end(JSON.stringify({ message: 'Route not found' }));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
