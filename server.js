require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');

const restaurantRoutes = require('./routes/restaurants');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Import Blacklist model
const Blacklist = require('./data/models/Blacklist');

// Blacklisting Middleware
app.use(async (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    try {
      const isBlocked = await Blacklist.findOne({ identifier: clientIP });
      if (isBlocked) {
        return res.status(403).json({ error: 'Your IP address has been blacklisted from making changes.' });
      }
    } catch (err) {
      console.error('Blacklist check error:', err);
    }
  }
  next();
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI;
if (mongoURI) {
  mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));
} else {
  console.log('⚠️ No MONGODB_URI found in .env file!');
}

// API Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/admin', adminRoutes);

// Fallback to index.html for any unknown routes (SPA like behavior)
app.get(/.*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
