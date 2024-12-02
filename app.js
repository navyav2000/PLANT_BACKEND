const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection
const MONGO_URI = "your_mongodb_connection_string"; // Replace with your MongoDB connection string
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Sample MongoDB Schema
const plantSchema = new mongoose.Schema({
  name: String,
  careSchedule: String,
  image: String,
});

const Plant = mongoose.model("Plant", plantSchema);

// API Endpoint to Fetch Data
app.get("/api/plants", async (req, res) => {
  try {
    const plants = await Plant.find();
    res.json(plants);
  } catch (err) {
    res.status(500).send("Error fetching plants data");
  }
});

// Serve Portfolio Website
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
