-- server/db/schema.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Session table for express-session storage
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- Routes table for flight routes
CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  origin_code VARCHAR(3) NOT NULL,
  origin_name VARCHAR(255) NOT NULL,
  destination_code VARCHAR(3) NOT NULL,
  destination_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tracking table for user's flight tracking preferences
CREATE TABLE IF NOT EXISTS tracking (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route_id INTEGER NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  departure_date DATE,
  return_date DATE,
  price_threshold DECIMAL(10, 2),
  alert_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, route_id, departure_date, return_date)
);

-- Price history for tracked routes
CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  route_id INTEGER NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  departure_date DATE NOT NULL,
  return_date DATE,
  price DECIMAL(10, 2) NOT NULL,
  airline VARCHAR(100),
  flight_numbers TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User alert preferences
CREATE TABLE IF NOT EXISTS alert_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_alerts BOOLEAN DEFAULT TRUE,
  price_drop_percentage INTEGER DEFAULT 15, -- Alert when price drops by 15%
  mistake_fare_threshold INTEGER DEFAULT 40, -- Alert for fares 40% below average
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Alert history
CREATE TABLE IF NOT EXISTS alert_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tracking_id INTEGER NOT NULL REFERENCES tracking(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  previous_price DECIMAL(10, 2) NOT NULL,
  percentage_change DECIMAL(5, 2) NOT NULL,
  alert_type VARCHAR(20) NOT NULL, -- 'PRICE_DROP' or 'MISTAKE_FARE'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Functions

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update timestamps
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_tracking_timestamp
BEFORE UPDATE ON tracking
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_alert_preferences_timestamp
BEFORE UPDATE ON alert_preferences
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tracking_user_id ON tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_route_id ON tracking(route_id);
CREATE INDEX IF NOT EXISTS idx_price_history_route_id ON price_history(route_id);
CREATE INDEX IF NOT EXISTS idx_price_history_dates ON price_history(departure_date, return_date);
CREATE INDEX IF NOT EXISTS idx_alert_history_user_id ON alert_history(user_id);
CREATE INDEX IF NOT EXISTS idx_route_codes ON routes(origin_code, destination_code);