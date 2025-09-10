const express = require('express');
const router = express.Router();
const {
  getTourCities,
  getTourCityBySlug
} = require('../controllers/tourCityController');

// Get all active tour cities
router.get('/', getTourCities);

// Get single tour city by slug
router.get('/:slug', getTourCityBySlug);

module.exports = router;
