const express = require('express');
const router = express.Router();
const Restaurant = require('../data/models/Restaurant');
const Blacklist = require('../data/models/Blacklist');

// Helper to check name blacklist
async function isNameBlocked(name) {
  const isBlocked = await Blacklist.findOne({ identifier: name });
  return !!isBlocked;
}

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
  const { name, location, cuisine, imageUrl, ...otherFields } = req.body;
  if (!name || !location || !cuisine) {
    return res.status(400).json({ error: 'Name, location, and cuisine are required.' });
  }

  try {
    if (await isNameBlocked(name)) {
      return res.status(403).json({ error: 'This name has been blacklisted.' });
    }
    const newRestaurant = new Restaurant({ 
      name, 
      location, 
      cuisine, 
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800',
      ...otherFields
    });
    const saved = await newRestaurant.save();
    
    const obj = saved.toObject();
    obj.id = obj._id;
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to save restaurant.' });
  }
});

// PUT (Edit) a restaurant
router.put('/:id', async (req, res) => {
  const { name, location, cuisine, imageUrl, ...otherFields } = req.body;
  try {
    if (name && await isNameBlocked(name)) {
      return res.status(403).json({ error: 'This name has been blacklisted.' });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found.' });

    // Update fields
    if (name) restaurant.name = name;
    if (location) restaurant.location = location;
    if (cuisine) restaurant.cuisine = cuisine;
    if (imageUrl) restaurant.imageUrl = imageUrl;

    // Direct assignment for other fields (handle carefully in production)
    Object.assign(restaurant, otherFields);

    const saved = await restaurant.save();
    const obj = saved.toObject();
    obj.id = obj._id;
    res.json(obj);
  } catch (err) {
    console.error('PUT /:id error:', err);
    res.status(500).json({ error: err.message || 'Failed to update restaurant.' });
  }
});

// POST a review to a restaurant
router.post('/:id/reviews', async (req, res) => {
  const { user, rating, comment, tags } = req.body;
  if (!user || !rating) {
    return res.status(400).json({ error: 'User and rating are required.' });
  }

  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }
    
    restaurant.reviews.push({ user, rating: Number(rating), comment, tags: tags || [] });
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
