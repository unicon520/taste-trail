const express = require('express');
const router = express.Router();
const Restaurant = require('../data/models/Restaurant');
const Blacklist = require('../data/models/Blacklist');

// DELETE a restaurant (Admin only route)
router.delete('/restaurants/:id', async (req, res) => {
  try {
    const deleted = await Restaurant.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Restaurant not found.' });
    res.json({ message: 'Restaurant deleted successfully.' });
  } catch (err) {
    console.error('DELETE /restaurants/:id error:', err);
    res.status(500).json({ error: 'Failed to delete restaurant.' });
  }
});

// GET all blacklisted items
router.get('/blacklist', async (req, res) => {
  try {
    const list = await Blacklist.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blacklist.' });
  }
});

// POST a new blacklist entry
router.post('/blacklist', async (req, res) => {
  const { identifier, reason } = req.body;
  if (!identifier) return res.status(400).json({ error: 'Identifier is required.' });

  try {
    const newItem = new Blacklist({ identifier, reason });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Identifier already blacklisted.' });
    res.status(500).json({ error: 'Failed to blacklist item.' });
  }
});

// DELETE a blacklist entry
router.delete('/blacklist/:id', async (req, res) => {
  try {
    await Blacklist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blacklist entry removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove blacklist entry.' });
  }
});

module.exports = router;
