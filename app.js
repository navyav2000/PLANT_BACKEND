const http = require('http');
const fs = require('fs');
const path = require('path');
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

// Utility function to serve static files
function serveStaticFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading the file');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
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

  // Serve the index.html file when accessing the root URL
  if (method === 'GET' && parsedUrl.pathname === '/') {
    serveStaticFile(res, path.join(__dirname, 'public', 'index.html'), 'text/html');
    return;
  }

  // Serve CSS file for styling
  if (method === 'GET' && parsedUrl.pathname === '/style.css') {
    serveStaticFile(res, path.join(__dirname, 'public', 'style.css'), 'text/css');
    return;
  }

  // Serve static image files from the images folder
if (method === 'GET' && parsedUrl.pathname.startsWith('/images/')) {
  const imageFileName = parsedUrl.pathname.replace('/images/', '');
  const imagePath = path.join(__dirname, 'public', 'images', imageFileName);

  fs.readFile(imagePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Image not found');
    } else {
      // Determine content type based on file extension
      const ext = path.extname(imageFileName).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
      };

      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
  return;
}


  // Handle the API route for plant data
  if (method === 'GET' && parsedUrl.pathname === '/api') {
    try {
      const db = dbClient.db('plantDB');
      const plantsCollection = db.collection('plants');
      const plants = await plantsCollection.find({}).toArray();

      if (plants.length > 0) {
        sendJsonResponse(res, 200, plants); // Return all plants in JSON format
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
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
