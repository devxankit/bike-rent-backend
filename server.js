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
const blogRoutes = require('./routes/blogRoutes');
const taxiRoutes = require('./routes/taxiRoutes');
const taxiCityRoutes = require('./routes/taxiCityRoutes');
const adminTaxiCityRoutes = require('./routes/adminTaxiCityRoutes');
const tourRoutes = require('./routes/tourRoutes');
const connectDB = require('./db');

// Use routes
app.use('/api/bikes', bikeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/taxis', taxiRoutes);
app.use('/api/taxi-cities', taxiCityRoutes);
app.use('/api/admin/taxi-cities', adminTaxiCityRoutes);
app.use('/api/tours', tourRoutes);

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
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: Object.values(err.errors).map(e => e.message) 
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      message: 'Invalid ID format' 
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({ 
      message: 'Duplicate entry found' 
    });
  }
  
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File too large' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Too many files' 
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        message: 'Unexpected file field' 
      });
    }
  }
  
  // Handle Cloudinary timeout errors
  if (err.name === 'TimeoutError' || err.message?.includes('Request Timeout')) {
    return res.status(408).json({
      message: 'Image upload timeout. Please try again with smaller images.'
    });
  }
  
  // Handle Cloudinary invalid file errors
  if (err.message?.includes('Invalid image file') || err.message?.includes('Invalid file type')) {
    return res.status(400).json({
      message: 'Invalid image file. Please upload valid image files (JPEG, PNG, WebP, GIF, BMP, TIFF, SVG).'
    });
  }
  
  // Generic error response
  res.status(500).json({ 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception:', err);
  console.log('[Server] Shutting down gracefully...');
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[Server] Unhandled Rejection:', err);
  
  // Don't exit on Cloudinary errors or network issues
  if (err.name === 'TimeoutError' || 
      err.message?.includes('Request Timeout') ||
      err.message?.includes('Invalid image file') ||
      err.message?.includes('Invalid file type') ||
      err.message?.includes('ECONNRESET') ||
      err.message?.includes('ENOTFOUND') ||
      err.code === 'ECONNRESET' ||
      err.code === 'ENOTFOUND') {
    console.log('[Server] Network/Cloudinary error - continuing server operation...');
    return;
  }
  
  // For other errors, log and continue (don't exit)
  console.error('[Server] Unhandled rejection - continuing server operation...');
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
}); 