// server/amadeus-test.js
const Amadeus = require('amadeus');

// Initialize Amadeus with your credentials
const amadeus = new Amadeus({
  clientId: 'Tlk3zz2p6NIo8VJbTqQ0PTxxWP6zdJoC',
  clientSecret: 'AppN4o3iJo4LFR5T'
});

// Export the functions AND the client for testing
module.exports = {
  // Search for flight offers
  searchFlightOffers: async function(origin, destination, date) {
    try {
      console.log(`Searching flights from ${origin} to ${destination}`);
      const response = await amadeus.shopping.flightOffersSearch.get({
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: date,
        adults: 1
      });
      return response.data;
    } catch (error) {
      console.error('Error searching flights:', error.message);
      return [];
    }
  },
  
  // Get flight deals
  getFlightInspiration: async function(origin) {
    try {
      console.log(`Getting flight deals from ${origin}`);
      const response = await amadeus.shopping.flightDestinations.get({
        origin: origin
      });
      return response.data;
    } catch (error) {
      console.error('Error getting flight deals:', error.message);
      return [];
    }
  },
  
  // Direct access to the client for testing
  client: amadeus
};