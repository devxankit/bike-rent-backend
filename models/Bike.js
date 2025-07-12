const mongoose = require('mongoose');

const bikeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  features: [String],
  location: String,
  year: { type: Date, default: Date.now }, // Date of card creation
  fuelType: String,
  seat: Number,
  trips: Number,
  payAtPickup: Boolean,
  ownerPhone: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
  bookingPeriod: {
    from: { type: Date, default: null },
    to: { type: Date, default: null }
  },
  bookedDays: { type: Number, default: 0 },
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt

module.exports = mongoose.model('Bike', bikeSchema); 