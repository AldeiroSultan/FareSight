// server/routes/alerts.js
const express = require('express');
const { check, validationResult } = require('express-validator');
const pool = require('../db/pool');
const router = express.Router();
const logger = require('../utils/logger');
const emailService = require('../services/email');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
};

/**
 * @route   GET /api/alerts
 * @desc    Get all alerts for a user
 * @access  Private
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const alertsResult = await pool.query(`
      SELECT 
        t.id,
        r.origin_code,
        r.origin_name,
        r.destination_code,
        r.destination_name,
        t.departure_date,
        t.return_date,
        t.price_threshold,
        t.alert_enabled,
        t.created_at
      FROM tracking t
      JOIN routes r ON t.route_id = r.id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
    `, [req.session.userId]);
    
    res.json(alertsResult.rows.map(row => ({
      id: row.id,
      origin: {
        code: row.origin_code,
        name: row.origin_name
      },
      destination: {
        code: row.destination_code,
        name: row.destination_name
      },
      departureDate: row.departure_date,
      returnDate: row.return_date,
      priceThreshold: parseFloat(row.price_threshold),
      alertEnabled: row.alert_enabled,
      createdAt: row.created_at
    })));
  } catch (err) {
    logger.error('Error fetching alerts:', err);
    res.status(500).json({ message: 'Error fetching alerts' });
  }
});

/**
 * @route   POST /api/alerts
 * @desc    Create a new price alert
 * @access  Private
 */
router.post('/', [
  isAuthenticated,
  check('origin', 'Origin is required').isLength({ min: 3, max: 3 }),
  check('destination', 'Destination is required').isLength({ min: 3, max: 3 }),
  check('departureDate', 'Valid departure date is required').isDate(),
  check('returnDate', 'Return date must be a valid date').optional({ nullable: true }).isDate(),
  check('priceThreshold', 'Price threshold must be a positive number').isFloat({ min: 1 })
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { origin, destination, departureDate, returnDate, priceThreshold } = req.body;

  try {
    // Get or create route
    const routeResult = await pool.query(
      'SELECT id FROM routes WHERE origin_code = $1 AND destination_code = $2',
      [origin.toUpperCase(), destination.toUpperCase()]
    );
    
    let routeId;
    
    if (routeResult.rows.length > 0) {
      routeId = routeResult.rows[0].id;
    } else {
      // Create new route with placeholder names (in a real app, fetch from an airport database)
      const newRouteResult = await pool.query(
        'INSERT INTO routes (origin_code, origin_name, destination_code, destination_name) VALUES ($1, $2, $3, $4) RETURNING id',
        [
          origin.toUpperCase(), 
          `${origin.toUpperCase()} Airport`, 
          destination.toUpperCase(), 
          `${destination.toUpperCase()} Airport`
        ]
      );
      routeId = newRouteResult.rows[0].id;
    }
    
    // Create tracking
    const trackingResult = await pool.query(
      'INSERT INTO tracking (user_id, route_id, departure_date, return_date, price_threshold) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [req.session.userId, routeId, departureDate, returnDate, priceThreshold]
    );
    
    res.status(201).json({ 
      id: trackingResult.rows[0].id,
      message: 'Price alert created successfully' 
    });
  } catch (err) {
    logger.error('Error creating alert:', err);
    
    // Check for duplicate alert
    if (err.code === '23505') { // PostgreSQL unique violation code
      return res.status(400).json({ message: 'You already have an alert for this route and dates' });
    }
    
    res.status(500).json({ message: 'Error creating price alert' });
  }
});

/**
 * @route   PUT /api/alerts/:id
 * @desc    Update an existing price alert
 * @access  Private
 */
router.put('/:id', [
  isAuthenticated,
  check('priceThreshold', 'Price threshold must be a positive number').optional().isFloat({ min: 1 }),
  check('alertEnabled', 'Alert enabled must be a boolean').optional().isBoolean()
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { priceThreshold, alertEnabled } = req.body;

  try {
    // Check if alert exists and belongs to user
    const alertCheck = await pool.query(
      'SELECT id FROM tracking WHERE id = $1 AND user_id = $2',
      [id, req.session.userId]
    );
    
    if (alertCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Alert not found or not authorized' });
    }
    
    // Build update query
    let updateQuery = 'UPDATE tracking SET updated_at = NOW()';
    const queryParams = [];
    let paramCount = 1;
    
    if (priceThreshold !== undefined) {
      updateQuery += `, price_threshold = $${paramCount}`;
      queryParams.push(priceThreshold);
      paramCount++;
    }
    
    if (alertEnabled !== undefined) {
      updateQuery += `, alert_enabled = $${paramCount}`;
      queryParams.push(alertEnabled);
      paramCount++;
    }
    
    updateQuery += ` WHERE id = $${paramCount} AND user_id = $${paramCount + 1}`;
    queryParams.push(id, req.session.userId);
    
    await pool.query(updateQuery, queryParams);
    
    res.json({ message: 'Price alert updated successfully' });
  } catch (err) {
    logger.error('Error updating alert:', err);
    res.status(500).json({ message: 'Error updating price alert' });
  }
});

/**
 * @route   DELETE /api/alerts/:id
 * @desc    Delete a price alert
 * @access  Private
 */
router.delete('/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    // Check if alert exists and belongs to user
    const alertCheck = await pool.query(
      'SELECT id FROM tracking WHERE id = $1 AND user_id = $2',
      [id, req.session.userId]
    );
    
    if (alertCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Alert not found or not authorized' });
    }
    
    // Delete alert
    await pool.query(
      'DELETE FROM tracking WHERE id = $1 AND user_id = $2',
      [id, req.session.userId]
    );
    
    res.json({ message: 'Price alert deleted successfully' });
  } catch (err) {
    logger.error('Error deleting alert:', err);
    res.status(500).json({ message: 'Error deleting price alert' });
  }
});

/**
 * @route   GET /api/alerts/history
 * @desc    Get alert history for a user
 * @access  Private
 */
router.get('/history', isAuthenticated, async (req, res) => {
  try {
    const historyResult = await pool.query(`
      SELECT 
        ah.id,
        r.origin_code,
        r.origin_name,
        r.destination_code,
        r.destination_name,
        t.departure_date,
        t.return_date,
        ah.price,
        ah.previous_price,
        ah.percentage_change,
        ah.alert_type,
        ah.sent_at
      FROM alert_history ah
      JOIN tracking t ON ah.tracking_id = t.id
      JOIN routes r ON t.route_id = r.id
      WHERE ah.user_id = $1
      ORDER BY ah.sent_at DESC
      LIMIT 100
    `, [req.session.userId]);
    
    res.json(historyResult.rows.map(row => ({
      id: row.id,
      origin: {
        code: row.origin_code,
        name: row.origin_name
      },
      destination: {
        code: row.destination_code,
        name: row.destination_name
      },
      departureDate: row.departure_date,
      returnDate: row.return_date,
      price: parseFloat(row.price),
      previousPrice: parseFloat(row.previous_price),
      percentageChange: parseFloat(row.percentage_change),
      alertType: row.alert_type,
      sentAt: row.sent_at
    })));
  } catch (err) {
    logger.error('Error fetching alert history:', err);
    res.status(500).json({ message: 'Error fetching alert history' });
  }
});

/**
 * @route   GET /api/alerts/preferences
 * @desc    Get user alert preferences
 * @access  Private
 */
router.get('/preferences', isAuthenticated, async (req, res) => {
  try {
    const prefsResult = await pool.query(
      'SELECT * FROM alert_preferences WHERE user_id = $1',
      [req.session.userId]
    );
    
    if (prefsResult.rows.length === 0) {
      // Create default preferences if not found
      const defaultPrefs = await pool.query(
        'INSERT INTO alert_preferences (user_id) VALUES ($1) RETURNING *',
        [req.session.userId]
      );
      
      return res.json({
        emailAlerts: defaultPrefs.rows[0].email_alerts,
        priceDropPercentage: defaultPrefs.rows[0].price_drop_percentage,
        mistakeFareThreshold: defaultPrefs.rows[0].mistake_fare_threshold
      });
    }
    
    res.json({
      emailAlerts: prefsResult.rows[0].email_alerts,
      priceDropPercentage: prefsResult.rows[0].price_drop_percentage,
      mistakeFareThreshold: prefsResult.rows[0].mistake_fare_threshold
    });
  } catch (err) {
    logger.error('Error fetching alert preferences:', err);
    res.status(500).json({ message: 'Error fetching alert preferences' });
  }
});

/**
 * @route   PUT /api/alerts/preferences
 * @desc    Update user alert preferences
 * @access  Private
 */
router.put('/preferences', [
  isAuthenticated,
  check('emailAlerts', 'Email alerts must be a boolean').optional().isBoolean(),
  check('priceDropPercentage', 'Price drop percentage must be between 1 and 90').optional().isInt({ min: 1, max: 90 }),
  check('mistakeFareThreshold', 'Mistake fare threshold must be between 10 and 90').optional().isInt({ min: 10, max: 90 })
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { emailAlerts, priceDropPercentage, mistakeFareThreshold } = req.body;

  try {
    // Check if preferences exist
    const prefsCheck = await pool.query(
      'SELECT id FROM alert_preferences WHERE user_id = $1',
      [req.session.userId]
    );
    
    if (prefsCheck.rows.length === 0) {
      // Create preferences if not found
      const newPrefs = {};
      if (emailAlerts !== undefined) newPrefs.email_alerts = emailAlerts;
      if (priceDropPercentage !== undefined) newPrefs.price_drop_percentage = priceDropPercentage;
      if (mistakeFareThreshold !== undefined) newPrefs.mistake_fare_threshold = mistakeFareThreshold;
      
      await pool.query(
        'INSERT INTO alert_preferences (user_id, email_alerts, price_drop_percentage, mistake_fare_threshold) VALUES ($1, $2, $3, $4)',
        [
          req.session.userId, 
          newPrefs.email_alerts !== undefined ? newPrefs.email_alerts : true,
          newPrefs.price_drop_percentage !== undefined ? newPrefs.price_drop_percentage : 15,
          newPrefs.mistake_fare_threshold !== undefined ? newPrefs.mistake_fare_threshold : 40
        ]
      );
    } else {
      // Build update query
      let updateQuery = 'UPDATE alert_preferences SET updated_at = NOW()';
      const queryParams = [];
      let paramCount = 1;
      
      if (emailAlerts !== undefined) {
        updateQuery += `, email_alerts = $${paramCount}`;
        queryParams.push(emailAlerts);
        paramCount++;
      }
      
      if (priceDropPercentage !== undefined) {
        updateQuery += `, price_drop_percentage = $${paramCount}`;
        queryParams.push(priceDropPercentage);
        paramCount++;
      }
      
      if (mistakeFareThreshold !== undefined) {
        updateQuery += `, mistake_fare_threshold = $${paramCount}`;
        queryParams.push(mistakeFareThreshold);
        paramCount++;
      }
      
      updateQuery += ` WHERE user_id = $${paramCount}`;
      queryParams.push(req.session.userId);
      
      await pool.query(updateQuery, queryParams);
    }
    
    res.json({ message: 'Alert preferences updated successfully' });
  } catch (err) {
    logger.error('Error updating alert preferences:', err);
    res.status(500).json({ message: 'Error updating alert preferences' });
  }
});

module.exports = router;