const http = require('http');
const { MongoClient, ObjectId } = require('mongodb');
const url = require('url');
const querystring = require('querystring');

// MongoDB connection URI and client setup
const uri = 'mongodb+srv://navya2000v:5QYtY04Ch02p73Qb@plant.dexcs.mongodb.net/plantDB?retryWrites=true&w=majority';
let dbClient;

// Connect to MongoDB
async function connectToDb() {
  try {
    dbClient = new MongoClient(uri);
    await dbClient.connect();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

connectToDb();

// Insert plant data into the database if not present
async function insertPlants() {
  try {
    const db = dbClient.db('plantDB');
    const plantsCollection = db.collection('plants');

    const existingPlants = await plantsCollection.countDocuments();
    if (existingPlants === 0) {
      await plantsCollection.insertMany(plants);
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
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Get plant details by name from query parameter
  if (method === 'GET' && parsedUrl.pathname === '/api') {
    const query = parsedUrl.query;
    const plantName = query.name;

    if (!plantName) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Plant name query parameter is required' }));
      return;
    }

    try {
      const db = dbClient.db('plantDB');
      const plantsCollection = db.collection('plants');
      const plant = await plantsCollection.findOne({ name: plantName });

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
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
