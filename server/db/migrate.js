// server/db/migrate.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const logger = require('../utils/logger');

const run = async () => {
  // Create database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    logger.info('Starting database migration...');

    // Read schema.sql
    const schemaPath = path.join(__dirname, 'schema_alt.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the entire schema as a single query
    await pool.query(schema);

    logger.info('Database migration completed successfully');
  } catch (err) {
    logger.error('Database migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

run();