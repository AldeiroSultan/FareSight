// server/db/seed.js
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const logger = require('../logger');

// Sample data
const airports = [
  { code: 'JFK', name: 'New York John F. Kennedy International' },
  { code: 'LAX', name: 'Los Angeles International' },
  { code: 'SFO', name: 'San Francisco International' },
  { code: 'ORD', name: 'Chicago O\'Hare International' },
  { code: 'MIA', name: 'Miami International' },
  { code: 'LHR', name: 'London Heathrow' },
  { code: 'CDG', name: 'Paris Charles de Gaulle' },
  { code: 'FRA', name: 'Frankfurt am Main' },
  { code: 'AMS', name: 'Amsterdam Schiphol' },
  { code: 'MAD', name: 'Madrid Barajas' }
];

const seedDatabase = async () => {
  // Create database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    logger.info('Starting database seeding...');

    // Create a demo user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const userResult = await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id',
      ['demo@example.com', hashedPassword, 'Demo', 'User']
    );
    
    const userId = userResult.rows[0].id;
    
    // Create alert preferences for the user
    await pool.query(
      'INSERT INTO alert_preferences (user_id, email_alerts, price_drop_percentage, mistake_fare_threshold) VALUES ($1, $2, $3, $4)',
      [userId, true, 15, 40]
    );
    
    // Create routes
    for (let i = 0; i < airports.length; i++) {
      for (let j = 0; j < airports.length; j++) {
        if (i !== j) {
          // Don't create routes from an airport to itself
          await pool.query(
            'INSERT INTO routes (origin_code, origin_name, destination_code, destination_name) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
            [airports[i].code, airports[i].name, airports[j].code, airports[j].name]
          );
        }
      }
    }
    
    // Create some sample routes for tracking
    const routes = [
      { origin: 'JFK', destination: 'LHR' },
      { origin: 'LAX', destination: 'CDG' },
      { origin: 'SFO', destination: 'FRA' }
    ];
    
    for (const route of routes) {
      // Get route_id
      const routeResult = await pool.query(
        'SELECT id FROM routes WHERE origin_code = $1 AND destination_code = $2',
        [route.origin, route.destination]
      );
      
      if (routeResult.rows.length > 0) {
        const routeId = routeResult.rows[0].id;
        
        // Get current date and future dates
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 30);
        
        const formatDate = (date) => {
          return date.toISOString().split('T')[0];
        };
        
        // Create tracking record
        await pool.query(
          'INSERT INTO tracking (user_id, route_id, departure_date, return_date, price_threshold) VALUES ($1, $2, $3, $4, $5)',
          [userId, routeId, formatDate(futureDate), null, 500]
        );
        
        // Create sample price history
        const basePrice = 700;
        for (let i = 0; i < 10; i++) {
          const historyDate = new Date();
          historyDate.setDate(today.getDate() - i);
          
          // Random price variation
          const priceVariation = Math.floor(Math.random() * 100) - 50;
          const price = basePrice + priceVariation;
          
          await pool.query(
            'INSERT INTO price_history (route_id, departure_date, return_date, price, airline, flight_numbers) VALUES ($1, $2, $3, $4, $5, $6)',
            [routeId, formatDate(futureDate), null, price, 'AA', 'AA123']
          );
        }
      }
    }
    
    logger.info('Database seeding completed successfully');
  } catch (err) {
    logger.error('Database seeding failed:', err);
  } finally {
    await pool.end();
  }
};

seedDatabase();