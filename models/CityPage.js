const mongoose = require('mongoose');

const cityPageSchema = new mongoose.Schema({
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

module.exports = mongoose.model('CityPage', cityPageSchema);
