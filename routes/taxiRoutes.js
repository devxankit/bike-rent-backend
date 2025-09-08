const express = require('express');
const router = express.Router();
const taxiController = require('../controllers/taxiController');
const { auth, admin } = require('../middleware/auth');
const { taxiUpload } = require('../utils/cloudinary');

// Get all taxis (public)
router.get('/', taxiController.getAllTaxis);

// Admin routes
router.post('/', auth, admin, taxiUpload.single('image'), taxiController.addTaxi);
router.put('/:id', auth, admin, taxiUpload.single('image'), taxiController.updateTaxi);
router.delete('/:id', auth, admin, taxiController.deleteTaxi);
router.patch('/:id/booking', auth, admin, taxiController.updateBookingStatus);

module.exports = router;
