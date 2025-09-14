const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  duration: { type: String, required: true }, // e.g., "3 Days / 2 Nights"
  location: { type: String, required: true },
  difficulty: { type: String, required: true }, // Easy, Moderate, Hard
  groupSize: { type: String, required: true }, // e.g., "Max 12 people"
  languages: [{ type: String }], // e.g., ["English", "Hindi"]
  images: [{ type: String, required: true }], // Array of 5 image URLs
  features: [{ type: String }], // Array of features
  highlights: [{ type: String }], // Array of tour highlights
  itinerary: [{
    day: { type: Number, required: true },
    title: { type: String, required: true },
    activities: [{ type: String }]
  }],
  inclusions: [{ type: String }], // What's included
  exclusions: [{ type: String }], // What's not included
  whatToBring: [{ type: String }], // What to bring list
  cancellationPolicy: { type: String, required: true },
  bestTimeToVisit: { type: String, required: true },
  ageRestriction: { type: String, required: true },
  fitnessLevel: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false }, // For featured section on home
  isActive: { type: Boolean, default: true }, // To enable/disable tours
  ownerPhone: { type: String, required: true },
  payAtPickup: { type: Boolean, default: false },
  category: { type: String, required: true }, // Adventure, Cultural, Beach, Wildlife, etc.
  tags: [{ type: String }], // For search and filtering
  termsAndConditions: [{ type: String }], // Dynamic terms and conditions
  guidelines: [{ type: String }], // Dynamic travel guidelines
}, { timestamps: true });

module.exports = mongoose.model('Tour', tourSchema);
