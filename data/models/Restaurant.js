const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  cuisine: { type: String, required: true },
  imageUrl: { type: String },
  rating: { type: Number, default: 0 },
  reviews: [reviewSchema],
  createdAt: { type: Date, default: Date.now }
});

// Calculate average rating before saving if reviews exist
restaurantSchema.pre('save', function() {
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating = (totalRating / this.reviews.length).toFixed(1);
  } else {
    this.rating = 0;
  }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
