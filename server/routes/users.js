// server/routes/users.js
const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const router = express.Router();
const logger = require('../utils/logger');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
};

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1',
      [req.session.userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Get alert count
    const alertCountResult = await pool.query(
      'SELECT COUNT(*) FROM tracking WHERE user_id = $1 AND alert_enabled = true',
      [req.session.userId]
    );
    
    const activeAlertCount = parseInt(alertCountResult.rows[0].count);
    
    // Get alert preferences
    const prefsResult = await pool.query(
      'SELECT * FROM alert_preferences WHERE user_id = $1',
      [req.session.userId]
    );
    
    const alertPreferences = prefsResult.rows.length > 0 ? {
      emailAlerts: prefsResult.rows[0].email_alerts,
      priceDropPercentage: prefsResult.rows[0].price_drop_percentage,
      mistakeFareThreshold: prefsResult.rows[0].mistake_fare_threshold
    } : {
      emailAlerts: true,
      priceDropPercentage: 15,
      mistakeFareThreshold: 40
    };
    
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      createdAt: user.created_at,
      activeAlertCount,
      alertPreferences
    });
  } catch (err) {
    logger.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', [
  isAuthenticated,
  check('firstName', 'First name is required').optional().notEmpty(),
  check('lastName', 'Last name is required').optional().notEmpty(),
  check('email', 'Please include a valid email').optional().isEmail()
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email } = req.body;

  try {
    // Build update query
    let updateQuery = 'UPDATE users SET updated_at = NOW()';
    const queryParams = [];
    let paramCount = 1;
    
    if (firstName !== undefined) {
      updateQuery += `, first_name = $${paramCount}`;
      queryParams.push(firstName);
      paramCount++;
    }
    
    if (lastName !== undefined) {
      updateQuery += `, last_name = $${paramCount}`;
      queryParams.push(lastName);
      paramCount++;
    }
    
    if (email !== undefined) {
      // Check if email already exists for another user
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase(), req.session.userId]
      );
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      updateQuery += `, email = $${paramCount}`;
      queryParams.push(email.toLowerCase());
      paramCount++;
    }
    
    updateQuery += ` WHERE id = $${paramCount} RETURNING id, email, first_name, last_name`;
    queryParams.push(req.session.userId);
    
    const updateResult = await pool.query(updateQuery, queryParams);
    
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const updatedUser = updateResult.rows[0];
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name
      }
    });
  } catch (err) {
    logger.error('Error updating user profile:', err);
    res.status(500).json({ message: 'Error updating user profile' });
  }
});

/**
 * @route   PUT /api/users/password
 * @desc    Update user password
 * @access  Private
 */
router.put('/password', [
  isAuthenticated,
  check('currentPassword', 'Current password is required').notEmpty(),
  check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    // Get current user
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.session.userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, req.session.userId]
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    logger.error('Error updating password:', err);
    res.status(500).json({ message: 'Error updating password' });
  }
});

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', isAuthenticated, async (req, res) => {
  try {
    // Delete user (cascade will delete related data)
    await pool.query(
      'DELETE FROM users WHERE id = $1',
      [req.session.userId]
    );
    
    // Destroy session
    req.session.destroy(err => {
      if (err) {
        logger.error('Session destruction error:', err);
      }
      
      res.clearCookie('connect.sid');
      res.json({ message: 'Account deleted successfully' });
    });
  } catch (err) {
    logger.error('Error deleting account:', err);
    res.status(500).json({ message: 'Error deleting account' });
  }
});

/**
 * @route   GET /api/users/dashboard
 * @desc    Get user dashboard data
 * @access  Private
 */
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    // Get active tracking
    const trackingResult = await pool.query(`
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
        (
          SELECT ph.price
          FROM price_history ph
          WHERE ph.route_id = t.route_id
          AND ph.departure_date = t.departure_date
          AND (ph.return_date = t.return_date OR (ph.return_date IS NULL AND t.return_date IS NULL))
          ORDER BY ph.timestamp DESC
          LIMIT 1
        ) as current_price,
        (
          SELECT json_build_object(
            'price', ph.price,
            'timestamp', ph.timestamp
          )
          FROM price_history ph
          WHERE ph.route_id = t.route_id
          AND ph.departure_date = t.departure_date
          AND (ph.return_date = t.return_date OR (ph.return_date IS NULL AND t.return_date IS NULL))
          ORDER BY ph.timestamp ASC
          LIMIT 1
        ) as initial_price
      FROM tracking t
      JOIN routes r ON t.route_id = r.id
      WHERE t.user_id = $1 AND t.alert_enabled = true
      ORDER BY t.departure_date ASC
      LIMIT 10
    `, [req.session.userId]);
    
    // Get recent alerts
    const alertsResult = await pool.query(`
      SELECT 
        ah.id,
        r.origin_code,
        r.destination_code,
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
      LIMIT 5
    `, [req.session.userId]);
    
    // Get price trend data
    const trendResult = await pool.query(`
      SELECT 
        r.origin_code || '-' || r.destination_code as route,
        ph.departure_date,
        ph.price,
        ph.timestamp
      FROM price_history ph
      JOIN routes r ON ph.route_id = r.id
      JOIN tracking t ON t.route_id = r.id
      WHERE t.user_id = $1
      ORDER BY ph.timestamp DESC
      LIMIT 100
    `, [req.session.userId]);
    
    // Format tracked routes for dashboard
    const trackedRoutes = trackingResult.rows.map(row => {
      const currentPrice = row.current_price ? parseFloat(row.current_price) : null;
      const initialPrice = row.initial_price ? parseFloat(row.initial_price.price) : null;
      const percentageChange = initialPrice && currentPrice
        ? ((currentPrice - initialPrice) / initialPrice) * 100
        : 0;
        
      return {
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
        currentPrice,
        initialPrice,
        percentageChange,
        status: currentPrice === null
          ? 'unknown'
          : currentPrice <= parseFloat(row.price_threshold)
            ? 'below-threshold'
            : 'above-threshold'
      };
    });
    
    // Format recent alerts
    const recentAlerts = alertsResult.rows.map(row => ({
      id: row.id,
      route: `${row.origin_code} to ${row.destination_code}`,
      price: parseFloat(row.price),
      previousPrice: parseFloat(row.previous_price),
      percentageChange: parseFloat(row.percentage_change),
      alertType: row.alert_type,
      sentAt: row.sent_at
    }));
    
    // Process price trend data
    const pricesTrend = {};
    trendResult.rows.forEach(row => {
      if (!pricesTrend[row.route]) {
        pricesTrend[row.route] = [];
      }
      
      pricesTrend[row.route].push({
        date: row.timestamp,
        price: parseFloat(row.price)
      });
    });
    
    const priceTrends = Object.keys(pricesTrend).map(route => ({
      route,
      data: pricesTrend[route].sort((a, b) => new Date(a.date) - new Date(b.date))
    }));
    
    res.json({
      trackedRoutes,
      recentAlerts,
      priceTrends
    });
  } catch (err) {
    logger.error('Error fetching dashboard data:', err);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

module.exports = router;