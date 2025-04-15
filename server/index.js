// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initPriceChecker } = require('./services/priceChecker');

// Import routes
const authRoutes = require('./routes/auth');
const flightRoutes = require('./routes/flights');
const alertRoutes = require('./routes/alerts');
const userRoutes = require('./routes/users');

// Check that routes are valid router objects
const validateRouter = (router, name) => {
  if (!router || typeof router.use !== 'function' || typeof router.route !== 'function') {
    console.error(`Error: ${name} is not a valid Express Router object`);
    return express.Router(); // Return empty router as fallback
  }
  return router;
};

// Validate routers
const validatedAuthRoutes = validateRouter(authRoutes, 'authRoutes');
const validatedFlightRoutes = validateRouter(flightRoutes, 'flightRoutes');
const validatedAlertRoutes = validateRouter(alertRoutes, 'alertRoutes');
const validatedUserRoutes = validateRouter(userRoutes, 'userRoutes');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev')); // Logging

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Session configuration
app.use(session({
  store: new pgSession({
    pool,
    tableName: 'session'
  }),
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
app.use('/api/auth', apiLimiter, validatedAuthRoutes);
app.use('/api/flights', validatedFlightRoutes);
app.use('/api/alerts', validatedAlertRoutes);
app.use('/api/users', validatedUserRoutes);

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
  
  // Initialize price checker in production or if explicitly enabled
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_PRICE_CHECKER === 'true') {
    try {
      initPriceChecker();
      console.log('Price checker initialized');
    } catch (error) {
      console.error('Failed to initialize price checker:', error);
    }
  }
});

module.exports = app; // For testing purposes