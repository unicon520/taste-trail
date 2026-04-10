const express = require('express');
const router = express.Router();
const store = require('../data/store');

// GET all restaurants
router.get('/', (req, res) => {
  res.json(store.getRestaurants());
});

// POST a new restaurant
router.post('/', (req, res) => {
  const { name, location, cuisine, imageUrl } = req.body;
  if (!name || !location || !cuisine) {
    return res.status(400).json({ error: 'Name, location, and cuisine are required.' });
  }
  
  const newRestaurant = store.addRestaurant({ 
    name, 
    location, 
    cuisine, 
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800' 
  });
  res.status(201).json(newRestaurant);
});

// POST a review to a restaurant
router.post('/:id/reviews', (req, res) => {
  const { user, rating, comment } = req.body;
  if (!user || !rating) {
    return res.status(400).json({ error: 'User and rating are required.' });
  }

  const updatedRestaurant = store.addReview(req.params.id, { user, rating, comment });
  
  if (!updatedRestaurant) {
    return res.status(404).json({ error: 'Restaurant not found.' });
  }
  
  res.status(201).json(updatedRestaurant);
});

module.exports = router;
