const express = require('express');
const router = express.Router();
const { 
  getAllTaxiCities, 
  createTaxiCity, 
  updateTaxiCity, 
  deleteTaxiCity, 
  getTaxiCityRoutes 
} = require('../controllers/taxiCityController');
const { auth, admin } = require('../middleware/auth');
const { taxiCityUpload } = require('../utils/cloudinary');

// Get all taxi cities (admin)
router.get('/', auth, admin, getAllTaxiCities);

// Get dynamic routes for all active taxi cities
router.get('/routes', auth, admin, getTaxiCityRoutes);

// Create new taxi city
router.post('/', auth, admin, taxiCityUpload.single('image'), createTaxiCity);

// Update taxi city
router.put('/:id', auth, admin, taxiCityUpload.single('image'), updateTaxiCity);

// Delete taxi city
router.delete('/:id', auth, admin, deleteTaxiCity);

module.exports = router;
