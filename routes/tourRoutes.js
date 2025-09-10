const express = require('express');
const router = express.Router();
const {
  getTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour
} = require('../controllers/tourController');
const { auth } = require('../middleware/auth');

// Public routes
router.get('/', getTours);
router.get('/:id', getTourById);

// Protected routes (admin only)
router.post('/', auth, createTour);
router.put('/:id', auth, updateTour);
router.delete('/:id', auth, deleteTour);

module.exports = router;
