const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const { auth, admin } = require('../middleware/auth');
const { tourUpload } = require('../utils/cloudinary');

// Public routes
router.get('/', tourController.getPublicTours);
router.get('/featured', tourController.getFeaturedTours);
router.get('/categories', tourController.getTourCategories);
router.get('/locations', tourController.getTourLocations);
router.get('/:id/related', tourController.getRelatedTours);
router.get('/:id', tourController.getTourById);

// Admin routes (require authentication and admin role)
router.get('/admin/all', auth, admin, tourController.getAllTours);
router.get('/admin/auth-status', auth, admin, tourController.getAuthStatus);

// Admin routes (require authentication and admin role)
router.post('/', auth, admin, tourUpload.array('images', 5), tourController.addTour);
router.put('/:id', auth, admin, tourUpload.array('images', 5), tourController.updateTour);
router.delete('/:id', auth, admin, tourController.deleteTour);
router.patch('/:id/featured', auth, admin, tourController.updateFeaturedStatus);
router.patch('/:id/active', auth, admin, tourController.updateActiveStatus);

module.exports = router;
