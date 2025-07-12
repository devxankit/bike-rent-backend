const express = require('express');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();
const User = require('../models/User');

router.get('/dashboard', auth, admin, (req, res) => {
  try {
    console.log('[AdminRoute] Dashboard accessed by:', req.user.email);
    res.json({ message: 'Welcome to the admin dashboard!', user: req.user });
  } catch (err) {
    console.error('[AdminRoute] Dashboard error:', err);
    res.status(500).json({ message: 'Admin dashboard error', error: err.message });
  }
});

router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

module.exports = router; 