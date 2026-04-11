const express = require('express');
const router = express.Router();
const Restaurant = require('../data/models/Restaurant');

// GET all restaurants
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    // Map _id to id for frontend compatibility
    const mapped = restaurants.map(r => {
      const obj = r.toObject();
      obj.id = obj._id;
      return obj;
    });
    res.json(mapped);
  } catch (err) {
    console.error('GET / error:', err);
    res.status(500).json({ error: 'Server error fetching restaurants.' });
  }
});

// GET single restaurant
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found.' });
    
    const obj = restaurant.toObject();
    obj.id = obj._id;
    res.json(obj);
  } catch (err) {
    console.error('GET /:id error:', err);
    res.status(500).json({ error: 'Server error or invalid ID.' });
  }
});

// POST a new restaurant
router.post('/', async (req, res) => {
  const { name, location, cuisine, imageUrl } = req.body;
  if (!name || !location || !cuisine) {
    return res.status(400).json({ error: 'Name, location, and cuisine are required.' });
  }
  
  try {
    const newRestaurant = new Restaurant({ 
      name, 
      location, 
      cuisine, 
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800' 
    });
    const saved = await newRestaurant.save();
    
    const obj = saved.toObject();
    obj.id = obj._id;
    res.status(201).json(obj);
  } catch (err) {
    console.error('POST / error saving restaurant:', err);
    res.status(500).json({ error: err.message || 'Failed to save restaurant.' });
  }
});

// POST a review to a restaurant
router.post('/:id/reviews', async (req, res) => {
  const { user, rating, comment } = req.body;
  if (!user || !rating) {
    return res.status(400).json({ error: 'User and rating are required.' });
  }

  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }
    
    restaurant.reviews.push({ user, rating: Number(rating), comment });
    const updated = await restaurant.save(); // pre-save hook calculates rating

    const obj = updated.toObject();
    obj.id = obj._id;
    res.status(201).json(obj);
  } catch (err) {
    console.error('POST /:id/reviews error:', err);
    res.status(500).json({ error: err.message || 'Failed to add review.' });
  }
});

module.exports = router;
