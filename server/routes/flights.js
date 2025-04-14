// server/routes/flights.js
const express = require('express');
const { check, validationResult } = require('express-validator');
const pool = require('../db/pool');
const router = express.Router();
const amadeusService = require('../services/amadeus');
const scraperService = require('../services/scraper');
const logger = require('../utils/logger');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
};

/**
 * @route   GET /api/flights/search
 * @desc    Search for flights
 * @access  Private
 */
router.get('/search', [
  isAuthenticated,
  check('origin', 'Origin is required').isLength({ min: 3, max: 3 }),
  check('destination', 'Destination is required').isLength({ min: 3, max: 3 }),
  check('departureDate', 'Valid departure date is required').isDate(),
  check('returnDate', 'Return date must be a valid date').optional({ nullable: true }).isDate()
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { origin, destination, departureDate, returnDate, adults = 1 } = req.query;

  try {
    // First try with Amadeus API
    try {
      const flightOffers = await amadeusService.searchFlightOffers(
        origin.toUpperCase(),
        destination.toUpperCase(),
        departureDate,
        returnDate,
        parseInt(adults),
        'USD'
      );
      
      if (flightOffers.length > 0) {
        // Store the cheapest flight in the price history
        const cheapestFlight = flightOffers[0];
        await storeFlightPrice(
          origin.toUpperCase(),
          destination.toUpperCase(),
          departureDate,
          returnDate,
          cheapestFlight.price.amount,
          cheapestFlight.validatingAirlineCodes[0],
          cheapestFlight.itineraries.map(i => 
            i.segments.map(s => `${s.carrierCode}${s.number}`).join(',')
          ).join('|')
        );
        
        return res.json(flightOffers);
      }
      
      // If Amadeus returns empty results, try web scraping
      logger.info('No results from Amadeus API, trying web scraper fallback');
      const scrapedFlights = await scraperService.scrapeFlights(
        origin.toUpperCase(),
        destination.toUpperCase(),
        departureDate,
        returnDate
      );
      
      if (scrapedFlights.length > 0) {
        // Store the cheapest scraped flight in price history
        const cheapestScraped = scrapedFlights[0];
        await storeFlightPrice(
          origin.toUpperCase(),
          destination.toUpperCase(),
          departureDate,
          returnDate,
          cheapestScraped.price.amount,
          cheapestScraped.airline,
          cheapestScraped.flightNumber
        );
      }
      
      return res.json(scrapedFlights);
    } catch (amadeusError) {
      logger.error('Amadeus API error:', amadeusError);
      
      // Try web scraping as fallback
      const scrapedFlights = await scraperService.scrapeFlights(
        origin.toUpperCase(),
        destination.toUpperCase(),
        departureDate,
        returnDate
      );
      
      if (scrapedFlights.length > 0) {
        // Store the cheapest scraped flight in price history
        const cheapestScraped = scrapedFlights[0];
        await storeFlightPrice(
          origin.toUpperCase(),
          destination.toUpperCase(),
          departureDate,
          returnDate,
          cheapestScraped.price.amount,
          cheapestScraped.airline,
          cheapestScraped.flightNumber
        );
        
        return res.json(scrapedFlights);
      }
      
      return res.status(404).json({ message: 'No flights found for the given criteria' });
    }
  } catch (err) {
    logger.error('Flight search error:', err);
    res.status(500).json({ message: 'Error searching for flights' });
  }
});

/**
 * @route   GET /api/flights/deals
 * @desc    Get flight deals/inspiration
 * @access  Private
 */
router.get('/deals', [
  isAuthenticated,
  check('origin', 'Origin is required').isLength({ min: 3, max: 3 })
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { origin } = req.query;

  try {
    const flightDeals = await amadeusService.getFlightInspiration(origin.toUpperCase(), 'USD');
    res.json(flightDeals);
  } catch (err) {
    logger.error('Flight deals error:', err);
    res.status(500).json({ message: 'Error fetching flight deals' });
  }
});

/**
 * @route   GET /api/flights/price-history
 * @desc    Get price history for a route
 * @access  Private
 */
router.get('/price-history', [
  isAuthenticated,
  check('origin', 'Origin is required').isLength({ min: 3, max: 3 }),
  check('destination', 'Destination is required').isLength({ min: 3, max: 3 }),
  check('departureDate', 'Valid departure date is required').optional().isDate(),
  check('returnDate', 'Return date must be a valid date').optional({ nullable: true }).isDate()
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { origin, destination, departureDate, returnDate } = req.query;

  try {
    // Get or create route id
    const routeId = await getOrCreateRouteId(origin.toUpperCase(), destination.toUpperCase());
    
    // Build query for price history
    let query = `
      SELECT 
        ph.price, 
        ph.airline, 
        ph.flight_numbers, 
        ph.timestamp,
        ph.departure_date,
        ph.return_date
      FROM price_history ph
      WHERE ph.route_id = $1
    `;
    
    const queryParams = [routeId];
    let paramCount = 2;
    
    if (departureDate) {
      query += ` AND ph.departure_date = $${paramCount}`;
      queryParams.push(departureDate);
      paramCount++;
    }
    
    if (returnDate) {
      query += ` AND (ph.return_date = $${paramCount} OR ph.return_date IS NULL)`;
      queryParams.push(returnDate);
    }
    
    query += ' ORDER BY ph.timestamp';
    
    const priceHistoryResult = await pool.query(query, queryParams);
    
    res.json(priceHistoryResult.rows.map(row => ({
      price: parseFloat(row.price),
      airline: row.airline,
      flightNumbers: row.flight_numbers,
      timestamp: row.timestamp,
      departureDate: row.departure_date,
      returnDate: row.return_date
    })));
  } catch (err) {
    logger.error('Price history error:', err);
    res.status(500).json({ message: 'Error fetching price history' });
  }
});

/**
 * Helper function to get or create a route ID
 * @param {string} originCode - Origin IATA code
 * @param {string} destinationCode - Destination IATA code
 * @returns {Promise<number>} Route ID
 */
async function getOrCreateRouteId(originCode, destinationCode) {
  // Check if route exists
  const routeCheck = await pool.query(
    'SELECT id FROM routes WHERE origin_code = $1 AND destination_code = $2',
    [originCode, destinationCode]
  );
  
  if (routeCheck.rows.length > 0) {
    return routeCheck.rows[0].id;
  }
  
  // Create new route
  // Note: In a production app, we would fetch the full names from an airport database
  const newRoute = await pool.query(
    'INSERT INTO routes (origin_code, origin_name, destination_code, destination_name) VALUES ($1, $2, $3, $4) RETURNING id',
    [originCode, getAirportName(originCode), destinationCode, getAirportName(destinationCode)]
  );
  
  return newRoute.rows[0].id;
}

/**
 * Helper function to store flight price in history
 * @param {string} originCode - Origin IATA code
 * @param {string} destinationCode - Destination IATA code
 * @param {string} departureDate - Departure date
 * @param {string} returnDate - Return date
 * @param {number} price - Flight price
 * @param {string} airline - Airline code
 * @param {string} flightNumbers - Flight numbers
 */
async function storeFlightPrice(originCode, destinationCode, departureDate, returnDate, price, airline, flightNumbers) {
  try {
    const routeId = await getOrCreateRouteId(originCode, destinationCode);
    
    await pool.query(
      'INSERT INTO price_history (route_id, departure_date, return_date, price, airline, flight_numbers) VALUES ($1, $2, $3, $4, $5, $6)',
      [routeId, departureDate, returnDate, price, airline, flightNumbers]
    );
    
    logger.info(`Stored price history for ${originCode} to ${destinationCode}: ${price}`);
  } catch (error) {
    logger.error('Error storing flight price:', error);
  }
}

/**
 * Helper function to get airport name (simplified)
 * In a real app, this would connect to an airport database
 * @param {string} iataCode - IATA airport code
 * @returns {string} Airport name
 */
function getAirportName(iataCode) {
  const airports = {
    'JFK': 'New York JFK',
    'LAX': 'Los Angeles',
    'SFO': 'San Francisco',
    'ORD': 'Chicago O\'Hare',
    'MIA': 'Miami',
    'LHR': 'London Heathrow',
    'CDG': 'Paris Charles de Gaulle',
    'FRA': 'Frankfurt',
    'AMS': 'Amsterdam',
    'MAD': 'Madrid',
    'BCN': 'Barcelona',
    'FCO': 'Rome Fiumicino',
    'SYD': 'Sydney',
    'MEL': 'Melbourne',
    'HKG': 'Hong Kong',
    'SIN': 'Singapore',
    'DXB': 'Dubai',
    'DEL': 'Delhi',
    'BOM': 'Mumbai',
    'GRU': 'São Paulo'
  };
  
  return airports[iataCode] || `${iataCode} Airport`;
}