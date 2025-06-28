require('dotenv').config({ path: './.env' });

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

const wearRoutes = require('./routes/wearRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require("./routes/userRoutes");



// Connect to DB
connectDB();

// Middleware
app.use(cors({
  origin: 'https://rmww-frontend.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Serve static images from /data
app.use("/images", express.static(path.join(__dirname, "data")));



// API Routes
app.use('/api', wearRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);



// Health check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
