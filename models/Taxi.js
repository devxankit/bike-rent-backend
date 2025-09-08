const mongoose = require('mongoose');

const taxiSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // e.g., "Maruti Suzuki Baleno"
  image: { type: String, required: true },
  location: { type: String, required: true },
  seatingCapacity: { type: Number, required: true, default: 4 },
  pricePerKm: { type: Number, required: true },
  pricePerTrip: { type: Number, required: true },
  rentalPricePerDay: { type: Number, required: true },
  acType: { type: String, required: true, enum: ['AC', 'Non-AC'] },
  luggageCapacity: { type: String, required: true },
  fuelType: { type: String, required: true },
  features: [String],
  ownerPhone: { type: String, required: true },
  tripsCount: { type: Number, default: 0 },
  payAtPickup: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  isBooked: { type: Boolean, default: false },
  bookingPeriod: {
    from: { type: Date, default: null },
    to: { type: Date, default: null }
  },
  bookedDays: { type: Number, default: 0 },
  year: { type: Date, default: Date.now }, // Date of card creation
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt

module.exports = mongoose.model('Taxi', taxiSchema);
