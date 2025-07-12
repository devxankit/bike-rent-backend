const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const bikeRoutes = require('./routes/bikeRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const connectDB = require('./db');

// Use routes
app.use('/api/bikes', bikeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Basic test route
app.get('/api', (req, res) => {
  res.json({ message: "API is working!" });
});

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[Server] Running on port ${PORT}`)); 