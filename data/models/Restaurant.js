const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  tags: [{ type: String }],
  helpfulVotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const categoryRatingsSchema = new mongoose.Schema({
  food: { type: Number, default: 0 },
  service: { type: Number, default: 0 },
  value: { type: Number, default: 0 },
  ambience: { type: Number, default: 0 }
}, { _id: false });

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  cuisine: { type: String, required: true },
  imageUrl: { type: String },
  gallery: [{ type: String }],
  rating: { type: Number, default: 0 },
  categoryRatings: { type: categoryRatingsSchema, default: () => ({}) },
  decisionScore: { type: Number, default: 0 }, 
  pros: [{ type: String }],
  cons: [{ type: String }],
  verdict: { type: String },
  popularDishes: [{ type: String }],
  bestFor: [{ type: String }],
  avoidIf: [{ type: String }],
  priceRange: { type: String, enum: ['$', '$$', '$$$', '$$$$'], default: '$$' },
  statusHours: { type: String, default: '11:00 AM - 10:00 PM' },
  peakHours: { type: String, default: '6:00 PM - 8:00 PM' },
  reservations: { type: String, default: 'Available via Phone' },
  reviews: [reviewSchema],
  createdAt: { type: Date, default: Date.now }
});

// Calculate average rating before saving if reviews exist
restaurantSchema.pre('save', function() {
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating = (totalRating / this.reviews.length).toFixed(1);
    this.decisionScore = ((this.rating / 5) * 10).toFixed(1);
  } else {
    this.rating = 0;
    this.decisionScore = 0;
  }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
