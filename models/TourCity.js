const mongoose = require('mongoose');

const tourCitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: null
  },
  tourTypes: [{
    type: {
      type: String,
      required: true
    },
    description: String,
    basePrice: Number,
    duration: String,
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  serviceAreas: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  seoTitle: {
    type: String,
    default: ''
  },
  seoDescription: {
    type: String,
    default: ''
  },
  metaKeywords: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TourCity', tourCitySchema);
