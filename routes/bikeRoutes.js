const express = require('express');
const router = express.Router();
const bikeController = require('../controllers/bikeController');
const { auth, admin } = require('../middleware/auth');
const upload = require('../utils/cloudinary');

// Get all bikes (public)
router.get('/', bikeController.getAllBikes);

// Admin routes
router.post('/', auth, admin, upload.single('image'), bikeController.addBike);
router.put('/:id', auth, admin, upload.single('image'), bikeController.updateBike);
router.delete('/:id', auth, admin, bikeController.deleteBike);
router.patch('/:id/booking', auth, admin, bikeController.updateBookingStatus);

module.exports = router; 