// server/services/priceChecker.js
const cron = require('node-cron');
const pool = require('../db/pool');
const amadeusService = require('./amadeus');
const scraperService = require('./scraper');
const emailService = require('./email');
const logger = require('../utils/logger');
const { isMistakeFare, isSignificantPriceDrop } = require('../utils/priceUtils');

// Initialize price checker
const initPriceChecker = () => {
  const intervalMinutes = process.env.SCHEDULE_INTERVAL_MINUTES || 60;
  
  // Create a cron expression that runs every X minutes
  // Format: minute hour day month day-of-week
  const cronExpression = `*/${intervalMinutes} * * * *`;
  
  logger.info(`Setting up price checker to run every ${intervalMinutes} minutes`);
  
  // Schedule the task
  cron.schedule(cronExpression, async () => {
    logger.info('Running scheduled price check...');
    await checkPrices();
  });
  
  // Run once on startup (after a delay to allow the server to initialize)
  setTimeout(async () => {
    await checkPrices();
  }, 10000);
};

// Check all tracked flight prices
const checkPrices = async () => {
  try {
    // Get all active tracking records
    const trackingResult = await pool.query(`
      SELECT 
        t.id,
        t.user_id,
        t.price_threshold,
        r.id as route_id,
        r.origin_code,
        r.origin_name,
        r.destination_code,
        r.destination_name,
        t.departure_date,
        t.return_date,
        ap.email_alerts,
        ap.price_drop_percentage,
        ap.mistake_fare_threshold,
        u.email,
        u.first_name
      FROM tracking t
      JOIN routes r ON t.route_id = r.id
      JOIN users u ON t.user_id = u.id
      JOIN alert_preferences ap ON u.id = ap.user_id
      WHERE t.alert_enabled = true
        AND t.departure_date >= CURRENT_DATE
    `);
    
    if (trackingResult.rows.length === 0) {
      logger.info('No active price tracking records found');
      return;
    }
    
    logger.info(`Found ${trackingResult.rows.length} active tracking records`);
    
    // Process each tracking record
    for (const tracking of trackingResult.rows) {
      await processTrackingRecord(tracking);
    }
    
    logger.info('Price check completed');
  } catch (err) {
    logger.error('Error during price check:', err);
  }
};

// Process a single tracking record
const processTrackingRecord = async (tracking) => {
  try {
    logger.info(`Checking prices for ${tracking.origin_code} to ${tracking.destination_code} on ${tracking.departure_date}`);
    
    // Try to get flight data from Amadeus
    let flightData;
    try {
      flightData = await amadeusService.searchFlightOffers(
        tracking.origin_code,
        tracking.destination_code,
        tracking.departure_date,
        tracking.return_date,
        1, // 1 adult
        'USD'
      );
    } catch (amadeusError) {
      logger.error(`Amadeus API error for ${tracking.origin_code} to ${tracking.destination_code}:`, amadeusError);
      
      // Try web scraping as fallback
      try {
        flightData = await scraperService.scrapeFlights(
          tracking.origin_code,
          tracking.destination_code,
          tracking.departure_date,
          tracking.return_date
        );
      } catch (scraperError) {
        logger.error(`Scraping error for ${tracking.origin_code} to ${tracking.destination_code}:`, scraperError);
        return; // Skip this record if both methods fail
      }
    }
    
    if (!flightData || flightData.length === 0) {
      logger.info(`No flight data found for ${tracking.origin_code} to ${tracking.destination_code}`);
      return;
    }
    
    // Get the lowest price
    const cheapestFlight = flightData[0];
    const currentPrice = cheapestFlight.price.amount;
    
    // Get previous price history
    const historyResult = await pool.query(`
      SELECT price
      FROM price_history
      WHERE route_id = $1
        AND departure_date = $2
        AND (return_date = $3 OR (return_date IS NULL AND $3 IS NULL))
      ORDER BY timestamp DESC
      LIMIT 10
    `, [
      tracking.route_id,
      tracking.departure_date,
      tracking.return_date
    ]);
    
    // Save the current price to history
    await pool.query(`
      INSERT INTO price_history (
        route_id, 
        departure_date, 
        return_date, 
        price, 
        airline, 
        flight_numbers
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      tracking.route_id,
      tracking.departure_date,
      tracking.return_date,
      currentPrice,
      cheapestFlight.validatingAirlineCodes ? cheapestFlight.validatingAirlineCodes[0] : (cheapestFlight.airline || 'Unknown'),
      cheapestFlight.itineraries ? getFlightNumbers(cheapestFlight) : (cheapestFlight.flightNumber || 'Unknown')
    ]);
    
    // Check if we have previous prices to compare
    if (historyResult.rows.length === 0) {
      logger.info(`First price record for ${tracking.origin_code} to ${tracking.destination_code}, no comparison possible`);
      return;
    }
    
    const previousPrice = parseFloat(historyResult.rows[0].price);
    
    // Extract all historical prices for mistake fare check
    const historicalPrices = historyResult.rows.map(row => parseFloat(row.price));
    
    // Check if the current price is below the user's threshold
    const belowThreshold = currentPrice <= tracking.price_threshold;
    
    // Check if the price dropped significantly compared to the previous check
    const priceDrop = isSignificantPriceDrop(
      previousPrice, 
      currentPrice, 
      tracking.price_drop_percentage
    );
    
    // Check if it's a mistake fare
    const mistakeFare = isMistakeFare(
      currentPrice,
      historicalPrices,
      tracking.mistake_fare_threshold
    );
    
    // Calculate percentage change
    const percentageChange = ((currentPrice - previousPrice) / previousPrice) * 100;
    
    // Determine if we should send an alert
    let shouldAlert = false;
    let alertType = null;
    
    if (mistakeFare) {
      shouldAlert = true;
      alertType = 'MISTAKE_FARE';
      logger.info(`Mistake fare detected for ${tracking.origin_code} to ${tracking.destination_code}: ${currentPrice} (${percentageChange.toFixed(2)}% change)`);
    } else if (priceDrop && belowThreshold) {
      shouldAlert = true;
      alertType = 'PRICE_DROP';
      logger.info(`Significant price drop for ${tracking.origin_code} to ${tracking.destination_code}: ${previousPrice} -> ${currentPrice} (${percentageChange.toFixed(2)}% change)`);
    }
    
    // Send alert if needed
    if (shouldAlert) {
      // Log the alert in database
      await pool.query(`
        INSERT INTO alert_history (
          user_id,
          tracking_id,
          price,
          previous_price,
          percentage_change,
          alert_type
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        tracking.user_id,
        tracking.id,
        currentPrice,
        previousPrice,
        percentageChange,
        alertType
      ]);
      
      // Send email alert if enabled
      if (tracking.email_alerts) {
        try {
          await emailService.sendPriceAlertEmail(
            {
              email: tracking.email,
              firstName: tracking.first_name
            },
            {
              origin: {
                code: tracking.origin_code,
                name: tracking.origin_name
              },
              destination: {
                code: tracking.destination_code,
                name: tracking.destination_name
              },
              departureDate: tracking.departure_date,
              returnDate: tracking.return_date,
              price: currentPrice,
              previousPrice: previousPrice
            },
            alertType,
            percentageChange
          );
          
          logger.info(`Email alert sent to ${tracking.email} for ${tracking.origin_code} to ${tracking.destination_code}`);
        } catch (emailError) {
          logger.error('Error sending price alert email:', emailError);
        }
      }
    }
  } catch (err) {
    logger.error(`Error processing tracking record for ${tracking.origin_code} to ${tracking.destination_code}:`, err);
  }
};

// Helper function to get flight numbers from Amadeus response
const getFlightNumbers = (flight) => {
  if (!flight.itineraries || flight.itineraries.length === 0) {
    return 'Unknown';
  }
  
  const segments = flight.itineraries[0].segments;
  
  return segments.map(segment => 
    `${segment.carrierCode}${segment.number}`
  ).join(',');
};

module.exports = {
  initPriceChecker,
  checkPrices
};