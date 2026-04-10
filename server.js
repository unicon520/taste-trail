const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const restaurantRoutes = require('./routes/restaurants');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/restaurants', restaurantRoutes);

// Fallback to index.html for any unknown routes (SPA like behavior)
app.get(/.*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
