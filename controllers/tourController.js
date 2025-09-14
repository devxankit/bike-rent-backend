const Tour = require('../models/Tour');

// Helper for logging
function log(controller, method, type, msg, err) {
  const base = `[${controller}] ${method} - ${msg}`;
  if (type === 'error') console.error(base, err || '');
  else if (type === 'warn') console.warn(base);
  else console.log(base);
}


// Check authentication status
exports.getAuthStatus = async (req, res) => {
  log('TourController', 'getAuthStatus', 'info', 'Entry');
  try {
    res.json({ 
      message: 'Authentication successful', 
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    log('TourController', 'getAuthStatus', 'error', 'Error:', err);
    res.status(500).json({ error: 'Authentication check failed', details: err.message });
  }
};

// Get public tours (only active tours)
exports.getPublicTours = async (req, res) => {
  log('TourController', 'getPublicTours', 'info', 'Entry');
  try {
    const filter = { isActive: true };
    
    // Apply filters
    if (req.query.location) {
      filter.location = { $regex: new RegExp(req.query.location, 'i') };
    }
    if (req.query.category) {
      filter.category = { $regex: new RegExp(req.query.category, 'i') };
    }
    if (req.query.difficulty) {
      filter.difficulty = { $regex: new RegExp(req.query.difficulty, 'i') };
    }
    if (req.query.price) {
      filter.price = { $lte: Number(req.query.price) };
    }
    if (req.query.name) {
      filter.name = { $regex: new RegExp(req.query.name, 'i') };
    }

    const tours = await Tour.find(filter).sort({ createdAt: -1 });
    log('TourController', 'getPublicTours', 'info', `Found ${tours.length} public tours`);
    res.json(tours);
  } catch (err) {
    log('TourController', 'getPublicTours', 'error', 'Error:', err);
    res.status(500).json({ error: 'Failed to fetch tours.' });
  }
};

// Get all tours (with optional filters) - Admin only
exports.getAllTours = async (req, res) => {
  log('TourController', 'getAllTours', 'info', 'Entry');
  log('TourController', 'getAllTours', 'info', 'User:', req.user);
  try {
    // Admin can see all tours (active and inactive)
    const filter = {};
    
    // Apply filters
    if (req.query.location) {
      filter.location = { $regex: new RegExp(req.query.location, 'i') };
    }
    if (req.query.category) {
      filter.category = { $regex: new RegExp(req.query.category, 'i') };
    }
    if (req.query.difficulty) {
      filter.difficulty = { $regex: new RegExp(req.query.difficulty, 'i') };
    }
    if (req.query.price) {
      filter.price = { $lte: Number(req.query.price) };
    }
    if (req.query.name) {
      filter.name = { $regex: new RegExp(req.query.name, 'i') };
    }
    if (req.query.isFeatured !== undefined) {
      filter.isFeatured = req.query.isFeatured === 'true';
    }
    if (req.query.tags) {
      filter.tags = { $in: req.query.tags.split(',') };
    }

    // Sorting
    let sort = { createdAt: -1 }; // Default: newest first
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price_asc':
          sort = { price: 1 };
          break;
        case 'price_desc':
          sort = { price: -1 };
          break;
        case 'rating':
          sort = { rating: -1 };
          break;
        case 'name':
          sort = { name: 1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    }

    const tours = await Tour.find(filter).sort(sort);
    log('TourController', 'getAllTours', 'info', 'Success');
    res.json(tours);
  } catch (err) {
    log('TourController', 'getAllTours', 'error', 'Error:', err);
    res.status(500).json({ error: 'Failed to fetch tours.' });
  }
};

// Get featured tours for home page
exports.getFeaturedTours = async (req, res) => {
  log('TourController', 'getFeaturedTours', 'info', 'Entry');
  try {
    const tours = await Tour.find({ isFeatured: true, isActive: true })
      .sort({ createdAt: -1 })
      .limit(6); // Limit to 6 featured tours
    log('TourController', 'getFeaturedTours', 'info', 'Success');
    res.json(tours);
  } catch (err) {
    log('TourController', 'getFeaturedTours', 'error', 'Error:', err);
    res.status(500).json({ error: 'Failed to fetch featured tours.' });
  }
};

// Get single tour by ID
exports.getTourById = async (req, res) => {
  log('TourController', 'getTourById', 'info', 'Entry');
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      log('TourController', 'getTourById', 'warn', 'Tour not found');
      return res.status(404).json({ error: 'Tour not found.' });
    }
    log('TourController', 'getTourById', 'info', 'Success');
    res.json(tour);
  } catch (err) {
    log('TourController', 'getTourById', 'error', 'Error:', err);
    res.status(500).json({ error: 'Failed to fetch tour.' });
  }
};

// Get related tours based on category, location, and tags
exports.getRelatedTours = async (req, res) => {
  log('TourController', 'getRelatedTours', 'info', 'Entry');
  try {
    const currentTour = await Tour.findById(req.params.id);
    if (!currentTour) {
      log('TourController', 'getRelatedTours', 'warn', 'Tour not found');
      return res.status(404).json({ error: 'Tour not found.' });
    }

    // Find related tours based on category, location, and tags
    const relatedTours = await Tour.find({
      _id: { $ne: currentTour._id },
      isActive: true,
      $or: [
        { category: currentTour.category },
        { location: { $regex: new RegExp(currentTour.location.split(',')[0], 'i') } },
        { tags: { $in: currentTour.tags } }
      ]
    })
    .sort({ rating: -1, createdAt: -1 })
    .limit(3)
    .select('name duration price originalPrice discount rating reviewCount location difficulty groupSize images description features category tags');

    log('TourController', 'getRelatedTours', 'info', `Found ${relatedTours.length} related tours`);
    res.json(relatedTours);
  } catch (err) {
    log('TourController', 'getRelatedTours', 'error', 'Error:', err);
    res.status(500).json({ error: 'Failed to fetch related tours.' });
  }
};

// Add a new tour
exports.addTour = async (req, res) => {
  try {
    // Handle multiple image uploads
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => file.path);
    }

    // Parse array fields from comma-separated strings
    if (req.body.features) {
      req.body.features = req.body.features.split(',').map(f => f.trim()).filter(f => f);
    }
    if (req.body.highlights) {
      req.body.highlights = req.body.highlights.split(',').map(h => h.trim()).filter(h => h);
    }
    if (req.body.inclusions) {
      req.body.inclusions = req.body.inclusions.split(',').map(i => i.trim()).filter(i => i);
    }
    if (req.body.exclusions) {
      req.body.exclusions = req.body.exclusions.split(',').map(e => e.trim()).filter(e => e);
    }
    if (req.body.whatToBring) {
      req.body.whatToBring = req.body.whatToBring.split(',').map(w => w.trim()).filter(w => w);
    }
    if (req.body.languages) {
      req.body.languages = req.body.languages.split(',').map(l => l.trim()).filter(l => l);
    }
    if (req.body.tags) {
      req.body.tags = req.body.tags.split(',').map(t => t.trim()).filter(t => t);
    }
    if (req.body.termsAndConditions) {
      req.body.termsAndConditions = req.body.termsAndConditions.split(',').map(t => t.trim()).filter(t => t);
    }
    if (req.body.guidelines) {
      req.body.guidelines = req.body.guidelines.split(',').map(g => g.trim()).filter(g => g);
    }

    // Parse itinerary if provided as JSON string
    if (req.body.itinerary && typeof req.body.itinerary === 'string') {
      try {
        req.body.itinerary = JSON.parse(req.body.itinerary);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid itinerary format.' });
      }
    }

    // Ensure itinerary has valid structure
    if (req.body.itinerary && Array.isArray(req.body.itinerary)) {
      req.body.itinerary = req.body.itinerary.filter(day => 
        day && day.title && day.title.trim() !== '' && day.activities && Array.isArray(day.activities)
      );
      
      // If no valid itinerary days, provide a default
      if (req.body.itinerary.length === 0) {
        req.body.itinerary = [{
          day: 1,
          title: 'Tour Day 1',
          activities: ['Welcome and introduction', 'Tour begins']
        }];
      }
    } else {
      // Provide default itinerary if none provided
      req.body.itinerary = [{
        day: 1,
        title: 'Tour Day 1',
        activities: ['Welcome and introduction', 'Tour begins']
      }];
    }

    // Calculate discount if originalPrice is provided
    if (req.body.originalPrice && req.body.price) {
      const originalPrice = Number(req.body.originalPrice);
      const price = Number(req.body.price);
      if (originalPrice > price) {
        req.body.discount = Math.round(((originalPrice - price) / originalPrice) * 100);
      } else {
        req.body.discount = 0;
      }
    }

    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'duration', 'location', 'difficulty', 'groupSize', 'ownerPhone', 'category'];
    for (const field of requiredFields) {
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        return res.status(400).json({ error: `${field} is required.` });
      }
    }

    // Validate images - make it optional for testing
    if (!req.body.images || req.body.images.length === 0) {
      req.body.images = ['https://res.cloudinary.com/dj6z5fgff/image/upload/v1753855454/bike_rent_bikes/hcsst7i3h539bqfviin4.jpg'];
    }

    // Ensure numeric fields are properly converted
    req.body.price = Number(req.body.price);
    req.body.originalPrice = req.body.originalPrice ? Number(req.body.originalPrice) : req.body.price;
    req.body.rating = req.body.rating ? Number(req.body.rating) : 0;
    req.body.reviewCount = req.body.reviewCount ? Number(req.body.reviewCount) : 0;

    // Ensure boolean fields are properly converted
    req.body.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
    req.body.isActive = req.body.isActive === 'true' || req.body.isActive === true || req.body.isActive === undefined;
    req.body.payAtPickup = req.body.payAtPickup === 'true' || req.body.payAtPickup === true;

    const tour = new Tour(req.body);
    await tour.save();
    res.status(201).json(tour);
  } catch (err) {
    
    // Handle Cloudinary timeout errors
    if (err.name === 'TimeoutError' || err.message?.includes('Request Timeout')) {
      return res.status(408).json({
        error: 'Image upload timeout. Please try again with smaller images.',
        details: 'The image upload took too long to process.'
      });
    }
    
    // Handle validation errors specifically
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors 
      });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: 'Tour with this name already exists' 
      });
    }
    
    // Generic error response
    res.status(500).json({ 
      error: 'Failed to add tour. Please try again.' 
    });
  }
};

// Update a tour
exports.updateTour = async (req, res) => {
  log('TourController', 'updateTour', 'info', 'Entry');
  try {
    // Handle multiple image uploads
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => file.path);
    }

    // Parse array fields from comma-separated strings
    if (req.body.features) {
      req.body.features = req.body.features.split(',').map(f => f.trim()).filter(f => f);
    }
    if (req.body.highlights) {
      req.body.highlights = req.body.highlights.split(',').map(h => h.trim()).filter(h => h);
    }
    if (req.body.inclusions) {
      req.body.inclusions = req.body.inclusions.split(',').map(i => i.trim()).filter(i => i);
    }
    if (req.body.exclusions) {
      req.body.exclusions = req.body.exclusions.split(',').map(e => e.trim()).filter(e => e);
    }
    if (req.body.whatToBring) {
      req.body.whatToBring = req.body.whatToBring.split(',').map(w => w.trim()).filter(w => w);
    }
    if (req.body.languages) {
      req.body.languages = req.body.languages.split(',').map(l => l.trim()).filter(l => l);
    }
    if (req.body.tags) {
      req.body.tags = req.body.tags.split(',').map(t => t.trim()).filter(t => t);
    }
    if (req.body.termsAndConditions) {
      req.body.termsAndConditions = req.body.termsAndConditions.split(',').map(t => t.trim()).filter(t => t);
    }
    if (req.body.guidelines) {
      req.body.guidelines = req.body.guidelines.split(',').map(g => g.trim()).filter(g => g);
    }

    // Parse itinerary if provided as JSON string
    if (req.body.itinerary && typeof req.body.itinerary === 'string') {
      try {
        req.body.itinerary = JSON.parse(req.body.itinerary);
      } catch (e) {
        log('TourController', 'updateTour', 'warn', 'Invalid itinerary JSON');
        return res.status(400).json({ error: 'Invalid itinerary format.' });
      }
    }

    // Ensure itinerary has valid structure
    if (req.body.itinerary && Array.isArray(req.body.itinerary)) {
      req.body.itinerary = req.body.itinerary.filter(day => 
        day && day.title && day.title.trim() !== '' && day.activities && Array.isArray(day.activities)
      );
      
      // If no valid itinerary days, provide a default
      if (req.body.itinerary.length === 0) {
        req.body.itinerary = [{
          day: 1,
          title: 'Tour Day 1',
          activities: ['Welcome and introduction', 'Tour begins']
        }];
      }
    }

    // Calculate discount if originalPrice is provided
    if (req.body.originalPrice && req.body.price) {
      const originalPrice = Number(req.body.originalPrice);
      const price = Number(req.body.price);
      if (originalPrice > price) {
        req.body.discount = Math.round(((originalPrice - price) / originalPrice) * 100);
      } else {
        req.body.discount = 0;
      }
    }

    // Ensure numeric fields are properly converted
    if (req.body.price) req.body.price = Number(req.body.price);
    if (req.body.originalPrice) req.body.originalPrice = Number(req.body.originalPrice);
    if (req.body.rating) req.body.rating = Number(req.body.rating);
    if (req.body.reviewCount) req.body.reviewCount = Number(req.body.reviewCount);

    // Ensure boolean fields are properly converted
    if (req.body.isFeatured !== undefined) {
      req.body.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
    }
    if (req.body.isActive !== undefined) {
      req.body.isActive = req.body.isActive !== 'false' && req.body.isActive !== false;
    }
    if (req.body.payAtPickup !== undefined) {
      req.body.payAtPickup = req.body.payAtPickup === 'true' || req.body.payAtPickup === true;
    }

    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!tour) {
      log('TourController', 'updateTour', 'warn', 'Tour not found');
      return res.status(404).json({ error: 'Tour not found.' });
    }
    log('TourController', 'updateTour', 'info', 'Success');
    res.json(tour);
  } catch (err) {
    log('TourController', 'updateTour', 'error', 'Error:', err);
    
    // Handle validation errors specifically
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors 
      });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: 'Tour with this name already exists' 
      });
    }
    
    // Handle cast errors (invalid ObjectId)
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid tour ID format' 
      });
    }
    
    // Generic error response
    res.status(500).json({ 
      error: 'Failed to update tour. Please try again.' 
    });
  }
};

// Update tour featured status
exports.updateFeaturedStatus = async (req, res) => {
  log('TourController', 'updateFeaturedStatus', 'info', 'Entry');
  try {
    const { isFeatured } = req.body;
    
    // Validate input
    if (typeof isFeatured !== 'boolean') {
      return res.status(400).json({ error: 'isFeatured must be a boolean value.' });
    }
    
    const tour = await Tour.findByIdAndUpdate(
      req.params.id, 
      { isFeatured }, 
      { new: true, runValidators: true }
    );
    if (!tour) {
      log('TourController', 'updateFeaturedStatus', 'warn', 'Tour not found');
      return res.status(404).json({ error: 'Tour not found.' });
    }
    log('TourController', 'updateFeaturedStatus', 'info', 'Success');
    res.json(tour);
  } catch (err) {
    log('TourController', 'updateFeaturedStatus', 'error', 'Error:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid tour ID format.' });
    }
    
    res.status(500).json({ error: 'Failed to update featured status.' });
  }
};

// Update tour active status
exports.updateActiveStatus = async (req, res) => {
  log('TourController', 'updateActiveStatus', 'info', 'Entry');
  try {
    const { isActive } = req.body;
    
    // Validate input
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean value.' });
    }
    
    const tour = await Tour.findByIdAndUpdate(
      req.params.id, 
      { isActive }, 
      { new: true, runValidators: true }
    );
    if (!tour) {
      log('TourController', 'updateActiveStatus', 'warn', 'Tour not found');
      return res.status(404).json({ error: 'Tour not found.' });
    }
    log('TourController', 'updateActiveStatus', 'info', 'Success');
    res.json(tour);
  } catch (err) {
    log('TourController', 'updateActiveStatus', 'error', 'Error:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid tour ID format.' });
    }
    
    res.status(500).json({ error: 'Failed to update active status.' });
  }
};

// Delete a tour
exports.deleteTour = async (req, res) => {
  log('TourController', 'deleteTour', 'info', 'Entry');
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      log('TourController', 'deleteTour', 'warn', 'Tour not found');
      return res.status(404).json({ error: 'Tour not found.' });
    }
    log('TourController', 'deleteTour', 'info', 'Success');
    res.json({ message: 'Tour deleted successfully' });
  } catch (err) {
    log('TourController', 'deleteTour', 'error', 'Error:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid tour ID format.' });
    }
    
    res.status(500).json({ error: 'Failed to delete tour.' });
  }
};

// Get tour categories
exports.getTourCategories = async (req, res) => {
  log('TourController', 'getTourCategories', 'info', 'Entry');
  try {
    const categories = await Tour.distinct('category', { isActive: true });
    log('TourController', 'getTourCategories', 'info', 'Success');
    res.json(categories);
  } catch (err) {
    log('TourController', 'getTourCategories', 'error', 'Error:', err);
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
};

// Get tour locations
exports.getTourLocations = async (req, res) => {
  log('TourController', 'getTourLocations', 'info', 'Entry');
  try {
    const locations = await Tour.distinct('location', { isActive: true });
    log('TourController', 'getTourLocations', 'info', 'Success');
    res.json(locations);
  } catch (err) {
    log('TourController', 'getTourLocations', 'error', 'Error:', err);
    res.status(500).json({ error: 'Failed to fetch locations.' });
  }
};
