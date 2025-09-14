const Taxi = require('../models/Taxi');

// Helper for logging
function log(controller, method, type, msg, err) {
  const base = `[${controller}] ${method} - ${msg}`;
  if (type === 'error') console.error(base, err || '');
  else if (type === 'warn') console.warn(base);
  else console.log(base);
}

// Get all taxis (with optional location and booking status filter)
exports.getAllTaxis = async (req, res) => {
  log('TaxiController', 'getAllTaxis', 'info', 'Entry');
  console.log('🔍 Taxi API called with query:', req.query);
  try {
    const filter = {};
    if (req.query.location) {
      filter.location = { $regex: new RegExp(req.query.location, 'i') };
      console.log('📍 Location filter applied:', filter.location);
    }
    if (req.query.isBooked !== undefined) {
      filter.isBooked = req.query.isBooked === 'true';
    }
    if (req.query.isAvailable !== undefined) {
      filter.isAvailable = req.query.isAvailable === 'true';
      console.log('✅ Availability filter applied:', filter.isAvailable);
    }
    // Price filter
    if (req.query.pricePerKm) {
      filter.pricePerKm = { $lte: Number(req.query.pricePerKm) };
    }
    if (req.query.pricePerTrip) {
      filter.pricePerTrip = { $lte: Number(req.query.pricePerTrip) };
    }
    if (req.query.rentalPricePerDay) {
      filter.rentalPricePerDay = { $lte: Number(req.query.rentalPricePerDay) };
    }
    // Name filter
    if (req.query.name) {
      filter.name = { $regex: new RegExp(req.query.name, 'i') };
    }
    // AC type filter
    if (req.query.acType) {
      filter.acType = req.query.acType;
    }
    // Fuel type filter
    if (req.query.fuelType) {
      filter.fuelType = req.query.fuelType;
    }
    // Seating capacity filter
    if (req.query.seatingCapacity) {
      filter.seatingCapacity = { $gte: Number(req.query.seatingCapacity) };
    }

    console.log('🔍 Final filter object:', filter);
    let taxis = await Taxi.find(filter);
    console.log('📊 Found taxis:', taxis.length);
    console.log('🚗 Taxi locations:', taxis.map(t => t.location));

    // Pickup date/time filter (exclude taxis booked at that time)
    if (req.query.pickupDate) {
      const pickupDateStr = req.query.pickupDate;
      let pickupDateTime;
      if (req.query.pickupTime) {
        pickupDateTime = new Date(`${pickupDateStr}T${req.query.pickupTime}`);
      } else {
        pickupDateTime = new Date(pickupDateStr);
      }
      taxis = taxis.filter(taxi => {
        if (!taxi.isBooked || !taxi.bookingPeriod || !taxi.bookingPeriod.from || !taxi.bookingPeriod.to) return true;
        const from = new Date(taxi.bookingPeriod.from);
        const to = new Date(taxi.bookingPeriod.to);
        // If pickupDateTime is outside the booking period, include the taxi
        return pickupDateTime < from || pickupDateTime > to;
      });
    }
    log('TaxiController', 'getAllTaxis', 'info', 'Success');
    res.json(taxis);
  } catch (err) {
    log('TaxiController', 'getAllTaxis', 'error', 'Error:', err);
    res.status(500).json({ error: 'Failed to fetch taxis.' });
  }
};

// Add a new taxi
exports.addTaxi = async (req, res) => {
  log('TaxiController', 'addTaxi', 'info', 'Entry');
  try {
    if (req.file) req.body.image = req.file.path;
    const { 
      name, 
      type, 
      image, 
      location, 
      seatingCapacity, 
      pricePerKm, 
      pricePerTrip, 
      rentalPricePerDay, 
      acType, 
      luggageCapacity, 
      fuelType, 
      features, 
      ownerPhone, 
      tripsCount, 
      payAtPickup,
      additionalInformation 
    } = req.body;
    
    if (!name || !type || !image || !location || !seatingCapacity || !pricePerKm || !pricePerTrip || !rentalPricePerDay || !acType || !luggageCapacity || !fuelType || !ownerPhone) {
      log('TaxiController', 'addTaxi', 'warn', 'Missing required fields');
      return res.status(400).json({ error: 'All required fields must be provided.' });
    }

    // Convert features string to array if provided
    if (features && typeof features === 'string') {
      req.body.features = features.split(',').map(f => f.trim()).filter(f => f);
    }

    const taxi = new Taxi(req.body);
    await taxi.save();
    log('TaxiController', 'addTaxi', 'info', 'Success');
    res.status(201).json(taxi);
  } catch (err) {
    log('TaxiController', 'addTaxi', 'error', 'Error:', err);
    res.status(400).json({ error: 'Failed to add taxi.' });
  }
};

// Update a taxi
exports.updateTaxi = async (req, res) => {
  log('TaxiController', 'updateTaxi', 'info', 'Entry');
  try {
    if (req.file) req.body.image = req.file.path;
    const { 
      name, 
      type, 
      image, 
      location, 
      seatingCapacity, 
      pricePerKm, 
      pricePerTrip, 
      rentalPricePerDay, 
      acType, 
      luggageCapacity, 
      fuelType, 
      features, 
      ownerPhone, 
      tripsCount, 
      payAtPickup,
      additionalInformation 
    } = req.body;
    
    if (!name || !type || !image || !location || !seatingCapacity || !pricePerKm || !pricePerTrip || !rentalPricePerDay || !acType || !luggageCapacity || !fuelType || !ownerPhone) {
      return res.status(400).json({ error: 'All required fields must be provided.' });
    }

    // Convert features string to array if provided
    if (features && typeof features === 'string') {
      req.body.features = features.split(',').map(f => f.trim()).filter(f => f);
    }

    const taxi = await Taxi.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!taxi) {
      log('TaxiController', 'updateTaxi', 'warn', 'Taxi not found');
      return res.status(404).json({ error: 'Taxi not found.' });
    }
    log('TaxiController', 'updateTaxi', 'info', 'Success');
    res.json(taxi);
  } catch (err) {
    log('TaxiController', 'updateTaxi', 'error', 'Error:', err);
    res.status(400).json({ error: 'Failed to update taxi.' });
  }
};

// Update booking status and period for a taxi
exports.updateBookingStatus = async (req, res) => {
  log('TaxiController', 'updateBookingStatus', 'info', 'Entry');
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
    const taxi = await Taxi.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!taxi) {
      log('TaxiController', 'updateBookingStatus', 'warn', 'Taxi not found');
      return res.status(404).json({ error: 'Taxi not found.' });
    }
    log('TaxiController', 'updateBookingStatus', 'info', 'Success');
    res.json(taxi);
  } catch (err) {
    log('TaxiController', 'updateBookingStatus', 'error', 'Error:', err);
    res.status(400).json({ error: 'Failed to update booking status.' });
  }
};

// Delete a taxi
exports.deleteTaxi = async (req, res) => {
  log('TaxiController', 'deleteTaxi', 'info', 'Entry');
  try {
    const taxi = await Taxi.findByIdAndDelete(req.params.id);
    if (!taxi) {
      log('TaxiController', 'deleteTaxi', 'warn', 'Taxi not found');
      return res.status(404).json({ error: 'Taxi not found.' });
    }
    log('TaxiController', 'deleteTaxi', 'info', 'Success');
    res.json({ message: 'Taxi deleted' });
  } catch (err) {
    log('TaxiController', 'deleteTaxi', 'error', 'Error:', err);
    res.status(400).json({ error: 'Failed to delete taxi.' });
  }
};
