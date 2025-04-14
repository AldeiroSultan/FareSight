// server/services/scraper/index.js
const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../../utils/logger');

// User agents to rotate through to avoid blocking
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Safari/537.36'
];

/**
 * Get a random user agent
 * @returns {string} Random user agent
 */
const getRandomUserAgent = () => {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

/**
 * Format date for URL
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date for URL
 */
const formatDateForUrl = (dateStr) => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Scrape flight data from Google Flights
 * @param {string} origin - Origin IATA code
 * @param {string} destination - Destination IATA code
 * @param {string} departureDate - Departure date (YYYY-MM-DD)
 * @param {string} returnDate - Return date (YYYY-MM-DD)
 * @returns {Promise<Array>} Flight offers
 */
const scrapeFlights = async (origin, destination, departureDate, returnDate = null) => {
  try {
    // In a real implementation, we would build a URL for Google Flights or another flight search engine
    // For this example, we'll simulate the scraping with mock data
    
    logger.info(`Scraping flight data for ${origin} to ${destination}`);
    
    // Simulate network delay to mimic real scraping
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate some realistic mock flight data
    const mockFlights = generateMockFlightData(origin, destination, departureDate, returnDate);
    
    return mockFlights;
  } catch (error) {
    logger.error('Error scraping flight data:', error);
    throw new Error('Error scraping flight data');
  }
};

/**
 * Generate mock flight data for demonstration
 * @param {string} origin - Origin IATA code
 * @param {string} destination - Destination IATA code
 * @param {string} departureDate - Departure date
 * @param {string} returnDate - Return date
 * @returns {Array} Mock flight data
 */
const generateMockFlightData = (origin, destination, departureDate, returnDate) => {
  const airlines = ['AA', 'DL', 'UA', 'LH', 'BA', 'AF', 'KL', 'EK', 'QR', 'SQ'];
  const flightCount = Math.floor(Math.random() * 8) + 3; // 3-10 flights
  
  // Base price factor based on route
  const routeBasePrices = {
    'JFK-LAX': 350,
    'JFK-SFO': 400,
    'JFK-LHR': 800,
    'JFK-CDG': 750,
    'LAX-JFK': 350,
    'LAX-LHR': 900,
    'SFO-JFK': 400,
    'LHR-JFK': 800,
    'CDG-JFK': 750,
    'default': 500
  };
  
  const routeKey = `${origin}-${destination}`;
  const basePrice = routeBasePrices[routeKey] || routeBasePrices.default;
  
  // Adjust price based on dates (closer dates are more expensive)
  const today = new Date();
  const departureDay = new Date(departureDate);
  const daysUntilDeparture = Math.max(1, Math.ceil((departureDay - today) / (1000 * 60 * 60 * 24)));
  
  // Price factor: closer dates have higher prices
  const dateFactor = daysUntilDeparture < 7 ? 1.5 : 
                    daysUntilDeparture < 14 ? 1.3 : 
                    daysUntilDeparture < 30 ? 1.1 : 1;
  
  // Return flights are typically more expensive
  const roundTripFactor = returnDate ? 0.8 : 1; // Round trips per leg are usually cheaper
  
  const flights = [];
  
  for (let i = 0; i < flightCount; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const flightNumber = String(1000 + Math.floor(Math.random() * 9000));
    
    // Random price variation factor
    const priceFactor = 0.9 + (Math.random() * 0.4); // 0.9 to 1.3
    
    // Calculate flight duration based on route (in minutes)
    let durationMinutes;
    if (routeKey.includes('JFK-LAX') || routeKey.includes('LAX-JFK')) {
      durationMinutes = 330 + Math.floor(Math.random() * 60); // ~5.5-6.5 hours
    } else if (routeKey.includes('JFK-LHR') || routeKey.includes('LHR-JFK')) {
      durationMinutes = 390 + Math.floor(Math.random() * 90); // ~6.5-8 hours
    } else {
      durationMinutes = 180 + Math.floor(Math.random() * 240); // 3-7 hours for other routes
    }
    
    // Format duration
    const durationHours = Math.floor(durationMinutes / 60);
    const durationMins = durationMinutes % 60;
    const formattedDuration = `${durationHours}h ${durationMins}m`;
    
    // Calculate departure and arrival times
    const departureTime = new Date(departureDate);
    departureTime.setHours(6 + Math.floor(Math.random() * 16)); // Departures between 6AM and 10PM
    departureTime.setMinutes(Math.floor(Math.random() * 60));
    
    const arrivalTime = new Date(departureTime);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + durationMinutes);
    
    // Format times
    const formatTime = (date) => {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    
    const formattedDepartureTime = formatTime(departureTime);
    const formattedArrivalTime = formatTime(arrivalTime);
    
    // Calculate final price
    const price = Math.round(basePrice * dateFactor * priceFactor * roundTripFactor);
    
    flights.push({
      id: `${airline}${flightNumber}-${i}`,
      price: {
        amount: price,
        currency: 'USD'
      },
      airline,
      flightNumber: `${airline}${flightNumber}`,
      departure: {
        airport: origin,
        time: formattedDepartureTime,
        date: departureDate
      },
      arrival: {
        airport: destination,
        time: formattedArrivalTime,
        date: departureDate // Same day arrival for simplicity
      },
      duration: formattedDuration,
      stops: Math.random() > 0.7 ? 1 : 0 // 30% flights have 1 stop
    });
  }
  
  // Sort by price
  flights.sort((a, b) => a.price.amount - b.price.amount);
  
  return flights;
};

module.exports = {
  scrapeFlights
};