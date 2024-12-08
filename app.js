const http = require('http');
const { MongoClient } = require('mongodb');
const url = require('url');

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

  // Get all plants data
  if (method === 'GET' && parsedUrl.pathname === '/api') {
    try {
      const db = dbClient.db('plantDB');
      const plantsCollection = db.collection('plants');
      const plants = await plantsCollection.find({}).toArray();

      if (plants.length > 0) {
        sendJsonResponse(res, 200, plants); // Return all plants
      } else {
        sendJsonResponse(res, 404, { message: 'No plants found' });
      }
    } catch (err) {
      sendJsonResponse(res, 500, { message: err.message });
    }

    return;
  }

  // Default route (if no matching route)
  sendJsonResponse(res, 404, { message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
