// simple-test.js - A very basic test script for Amadeus
// Run from the server directory: node simple-test.js

// Import the amadeus service
const amadeusService = require('./services/amadeus');

console.log('Testing Amadeus API...');

// Test the flight search function
async function testFlightSearch() {
  try {
    console.log('Searching for flights...');
    const flights = await amadeusService.searchFlightOffers(
      'JFK',  // Origin
      'LAX',  // Destination
      '2025-06-15'  // Departure date
    );
    
    console.log(`Success! Found ${flights.length} flights.`);
    if (flights.length > 0) {
      console.log('First flight price:', flights[0].price.total);
    }
    return true;
  } catch (error) {
    console.error('Flight search failed:', error.message);
    return false;
  }
}

// Test the flight deals function
async function testFlightDeals() {
  try {
    console.log('Searching for flight deals...');
    const deals = await amadeusService.getFlightInspiration('JFK');
    
    console.log(`Success! Found ${deals.length} deals.`);
    if (deals.length > 0) {
      console.log('First deal:', deals[0].destination, deals[0].price.amount);
    }
    return true;
  } catch (error) {
    console.error('Flight deals search failed:', error.message);
    return false;
  }
}

// Run both tests
async function runTests() {
  const searchResult = await testFlightSearch();
  const dealsResult = await testFlightDeals();
  
  if (searchResult && dealsResult) {
    console.log('\n✅ All tests passed! Your Amadeus API is working correctly.');
  } else {
    console.log('\n❌ Some tests failed. Check the errors above.');
  }
}

// Start the tests
runTests();