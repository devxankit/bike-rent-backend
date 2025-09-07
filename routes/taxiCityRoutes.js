const express = require('express');
const router = express.Router();
const { getTaxiCities, getTaxiCityBySlug } = require('../controllers/taxiCityController');

// Get all active taxi cities (public route)
router.get('/', getTaxiCities);

// Get single taxi city by slug (public route)
router.get('/:slug', getTaxiCityBySlug);

module.exports = router;
