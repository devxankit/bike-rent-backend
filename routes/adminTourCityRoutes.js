const express = require('express');
const router = express.Router();
const {
  getAllTourCities,
  createTourCity,
  updateTourCity,
  deleteTourCity,
  getTourCityRoutes
} = require('../controllers/tourCityController');
const { auth, admin } = require('../middleware/auth');
const { tourCityUpload } = require('../utils/cloudinary');

// Get all tour cities (admin)
router.get('/', auth, admin, getAllTourCities);

// Get tour city routes for dynamic routing
router.get('/routes', auth, admin, getTourCityRoutes);

// Create new tour city
router.post('/', auth, admin, tourCityUpload.single('image'), createTourCity);

// Update tour city
router.put('/:id', auth, admin, tourCityUpload.single('image'), updateTourCity);

// Delete tour city
router.delete('/:id', auth, admin, deleteTourCity);

module.exports = router;
