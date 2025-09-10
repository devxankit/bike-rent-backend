const Tour = require('../models/Tour');

// Get all tours with optional filtering
const getTours = async (req, res) => {
  try {
    const { location, name, price, isAvailable } = req.query;
    
    // Build filter object
    const filter = {};
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (price) filter.price = { $lte: Number(price) };
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    
    const tours = await Tour.find(filter).sort({ createdAt: -1 });
    res.json(tours);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tours', error: err.message });
  }
};

// Get single tour by ID
const getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.json(tour);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tour', error: err.message });
  }
};

// Create new tour
const createTour = async (req, res) => {
  try {
    const tour = new Tour(req.body);
    await tour.save();
    res.status(201).json(tour);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create tour', error: err.message });
  }
};

// Update tour
const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.json(tour);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update tour', error: err.message });
  }
};

// Delete tour
const deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.json({ message: 'Tour deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete tour', error: err.message });
  }
};

module.exports = {
  getTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour
};
