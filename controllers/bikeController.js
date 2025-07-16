const Bike = require('../models/Bike');

// Helper for logging
function log(controller, method, type, msg, err) {
  const base = `[${controller}] ${method} - ${msg}`;
  if (type === 'error') console.error(base, err || '');
  else if (type === 'warn') console.warn(base);
  else console.log(base);
}

// Get all bikes (with optional location and booking status filter)
exports.getAllBikes = async (req, res) => {
  log('BikeController', 'getAllBikes', 'info', 'Entry');
  try {
    const filter = {};
    if (req.query.location) {
      filter.location = { $regex: new RegExp(req.query.location, 'i') };
    }
    if (req.query.isBooked !== undefined) {
      filter.isBooked = req.query.isBooked === 'true';
    }
    // Price filter
    if (req.query.price) {
      filter.price = { $lte: Number(req.query.price) };
    }
    // Name filter
    if (req.query.name) {
      filter.name = { $regex: new RegExp(req.query.name, 'i') };
    }
    let bikes = await Bike.find(filter);

    // Pickup date/time filter (exclude bikes booked at that time)
    if (req.query.pickupDate) {
      const pickupDateStr = req.query.pickupDate;
      let pickupDateTime;
      if (req.query.pickupTime) {
        pickupDateTime = new Date(`${pickupDateStr}T${req.query.pickupTime}`);
      } else {
        pickupDateTime = new Date(pickupDateStr);
      }
      bikes = bikes.filter(bike => {
        if (!bike.isBooked || !bike.bookingPeriod || !bike.bookingPeriod.from || !bike.bookingPeriod.to) return true;
        const from = new Date(bike.bookingPeriod.from);
        const to = new Date(bike.bookingPeriod.to);
        // If pickupDateTime is outside the booking period, include the bike
        return pickupDateTime < from || pickupDateTime > to;
      });
    }
    log('BikeController', 'getAllBikes', 'info', 'Success');
    res.json(bikes);
  } catch (err) {
    log('BikeController', 'getAllBikes', 'error', 'Error:', err);
    res.status(500).json({ error: 'Failed to fetch bikes.' });
  }
};

// Add a new bike
exports.addBike = async (req, res) => {
  log('BikeController', 'addBike', 'info', 'Entry');
  try {
    if (req.file) req.body.image = req.file.path;
    const { name, price, image, location } = req.body;
    if (!name || !price || !image || !location) {
      log('BikeController', 'addBike', 'warn', 'Missing required fields');
      return res.status(400).json({ error: 'Name, price, image, and location are required.' });
    }
    const bike = new Bike(req.body);
    await bike.save();
    log('BikeController', 'addBike', 'info', 'Success');
    res.status(201).json(bike);
  } catch (err) {
    log('BikeController', 'addBike', 'error', 'Error:', err);
    res.status(400).json({ error: 'Failed to add bike.' });
  }
};

// Update a bike
exports.updateBike = async (req, res) => {
  log('BikeController', 'updateBike', 'info', 'Entry');
  try {
    if (req.file) req.body.image = req.file.path;
    const { name, price, image } = req.body;
    if (!name || !price || !image) {
      return res.status(400).json({ error: 'Name, price, and image are required.' });
    }
    const bike = await Bike.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bike) {
      log('BikeController', 'updateBike', 'warn', 'Bike not found');
      return res.status(404).json({ error: 'Bike not found.' });
    }
    log('BikeController', 'updateBike', 'info', 'Success');
    res.json(bike);
  } catch (err) {
    log('BikeController', 'updateBike', 'error', 'Error:', err);
    res.status(400).json({ error: 'Failed to update bike.' });
  }
};

// Update booking status and period for a bike
exports.updateBookingStatus = async (req, res) => {
  log('BikeController', 'updateBookingStatus', 'info', 'Entry');
  try {
    const { isBooked, bookingPeriod, bookedDays } = req.body;
    const update = {
      isBooked,
      bookingPeriod: bookingPeriod || { from: null, to: null },
      bookedDays: bookedDays || 0,
    };
    // If marking as unbooked, clear bookingPeriod and bookedDays
    if (!isBooked) {
      update.bookingPeriod = { from: null, to: null };
      update.bookedDays = 0;
    }
    const bike = await Bike.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!bike) {
      log('BikeController', 'updateBookingStatus', 'warn', 'Bike not found');
      return res.status(404).json({ error: 'Bike not found.' });
    }
    log('BikeController', 'updateBookingStatus', 'info', 'Success');
    res.json(bike);
  } catch (err) {
    log('BikeController', 'updateBookingStatus', 'error', 'Error:', err);
    res.status(400).json({ error: 'Failed to update booking status.' });
  }
};

// Delete a bike
exports.deleteBike = async (req, res) => {
  log('BikeController', 'deleteBike', 'info', 'Entry');
  try {
    const bike = await Bike.findByIdAndDelete(req.params.id);
    if (!bike) {
      log('BikeController', 'deleteBike', 'warn', 'Bike not found');
      return res.status(404).json({ error: 'Bike not found.' });
    }
    log('BikeController', 'deleteBike', 'info', 'Success');
    res.json({ message: 'Bike deleted' });
  } catch (err) {
    log('BikeController', 'deleteBike', 'error', 'Error:', err);
    res.status(400).json({ error: 'Failed to delete bike.' });
  }
}; 