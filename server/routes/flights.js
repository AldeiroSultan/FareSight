// server/routes/flights.js
const express = require('express');
const router = express.Router();
const amadeus = require('../services/amadeus');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
};

/**
 * @route   GET /api/flights/search
 * @desc    Search for flights
 * @access  Private
 */
router.get('/search', isAuthenticated, async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate, adults = 1 } = req.query;
    
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    // Call Amadeus API
    const flightOffers = await amadeus.searchFlightOffers(
      origin.toUpperCase(),
      destination.toUpperCase(),
      departureDate,
      returnDate,
      parseInt(adults),
      'USD'
    );
    
    res.json(flightOffers);
  } catch (err) {
    console.error('Flight search error:', err);
    res.status(500).json({ message: 'Error searching for flights' });
  }
});

/**
 * @route   GET /api/flights/deals
 * @desc    Get flight deals/inspiration
 * @access  Private
 */
router.get('/deals', isAuthenticated, async (req, res) => {
  try {
    const { origin } = req.query;
    
    if (!origin) {
      return res.status(400).json({ message: 'Origin is required' });
    }
    
    // Call Amadeus API
    const flightDeals = await amadeus.getFlightInspiration(origin.toUpperCase());
    
    res.json(flightDeals);
  } catch (err) {
    console.error('Flight deals error:', err);
    res.status(500).json({ message: 'Error fetching flight deals' });
  }
});

/**
 * @route   GET /api/flights/price-history
 * @desc    Get price history for a route
 * @access  Private
 */
router.get('/price-history', isAuthenticated, async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate } = req.query;
    
    // Here you would typically fetch price history from your database
    // For now, we'll return mock data
    const mockPriceHistory = generateMockPriceHistory(origin, destination, departureDate, returnDate);
    
    res.json(mockPriceHistory);
  } catch (err) {
    console.error('Price history error:', err);
    res.status(500).json({ message: 'Error fetching price history' });
  }
});

// Helper function to generate mock price history
function generateMockPriceHistory(origin, destination, departureDate, returnDate) {
  const data = [];
  const now = new Date();
  const basePrice = 500;
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    // Add some price variation
    const variance = Math.random() * 100 - 50;
    const price = Math.max(200, basePrice + variance);
    
    data.push({
      price: Math.round(price),
      airline: ['AA', 'DL', 'UA', 'BA'][Math.floor(Math.random() * 4)],
      timestamp: date.toISOString(),
      departureDate,
      returnDate
    });
  }
  
  return data;
}

// Make sure to export the router
module.exports = router;