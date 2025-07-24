const express = require('express');
const router = express.Router();
const CityPage = require('../models/CityPage');

// Get all active city pages (public route)
router.get('/', async (req, res) => {
  try {
    const cityPages = await CityPage.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(cityPages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch city pages', error: err.message });
  }
});

// Get single city page by slug (public route)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const cityPage = await CityPage.findOne({ slug, isActive: true });
    
    if (!cityPage) {
      return res.status(404).json({ message: 'City page not found' });
    }
    
    res.json(cityPage);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch city page', error: err.message });
  }
});

module.exports = router;
