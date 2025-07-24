const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enhanced CORS configuration for production
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
 }
next();
});

// app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Import routes
const bikeRoutes = require('./routes/bikeRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cityRoutes = require('./routes/cityRoutes');
const connectDB = require('./db');

// Use routes
app.use('/api/bikes', bikeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cities', cityRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: "API is working!", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic test route
app.get('/api', (req, res) => {
  res.json({ message: "API is working!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server] Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
}); 