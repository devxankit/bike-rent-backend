const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 1,
    max: 5
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  features: [String],
  itinerary: [String],
  inclusions: [String],
  exclusions: [String],
  ownerPhone: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tour', tourSchema);
