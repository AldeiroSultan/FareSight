// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/auth');
const flightRoutes = require('./routes/flights');
const alertRoutes = require('./routes/alerts');
const userRoutes = require('./routes/users');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev')); // Logging

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'flight_tracker_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  }
}));

// Routes
// Validate router before using it
const validateRouter = (router, name) => {
  if (!router || typeof router.use !== 'function' || typeof router.route !== 'function') {
    console.error(`Error: ${name} is not a valid Express Router object`);
    return express.Router(); // Return empty router as fallback
  }
  return router;
};

app.use('/api/auth', validateRouter(authRoutes, 'authRoutes'));
app.use('/api/flights', validateRouter(flightRoutes, 'flightRoutes'));
app.use('/api/alerts', validateRouter(alertRoutes, 'alertRoutes'));
app.use('/api/users', validateRouter(userRoutes, 'userRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing purposes