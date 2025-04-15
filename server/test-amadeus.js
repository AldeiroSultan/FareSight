// test-amadeus.js - Run this file directly from the server directory
// Example: node test-amadeus.js

// Set up environment variables - this uses your hardcoded credentials
process.env.AMADEUS_CLIENT_ID = 'Tlk3zz2p6NIo8VJbTqQ0PTxxWP6zdJoC';
process.env.AMADEUS_CLIENT_SECRET = 'AppN4o3iJo4LFR5T';

// Import the Amadeus service - using correct relative path
const amadeusService = require('./services/amadeus');

// Function to test the Amadeus API
async function testAmadeusAPI() {
  console.log('🛫 TESTING AMADEUS API CONNECTION 🛫');
  console.log('===================================');
  
  try {
    // Test 1: Search for flights
    console.log('\n📋 TEST 1: FLIGHT SEARCH');
    console.log('Searching for flights from JFK to LAX on 2025-06-15...');
    
    const flightResults = await amadeusService.searchFlightOffers(
      'JFK',  // Origin
      'LAX',  // Destination
      '2025-06-15',  // Departure date
      null,   // Return date (one-way)
      1,      // Adults
      'USD'   // Currency
    );
    
    if (flightResults.length > 0) {
      console.log('✅ SUCCESS! Found flights:');
      console.log(`   Found ${flightResults.length} flights`);
      
      // Display the first flight
      const flight = flightResults[0];
      console.log('\n📊 First Flight Details:');
      console.log(`   Price: $${flight.price.total}`);
      console.log(`   Airline: ${flight.validatingAirlineCodes[0]}`);
      
      if (flight.itineraries && flight.itineraries[0].segments) {
        const segment = flight.itineraries[0].segments[0];
        console.log(`   Departure: ${segment.departure.at}`);
        console.log(`   Arrival: ${segment.arrival.at}`);
        console.log(`   Duration: ${flight.itineraries[0].duration}`);
      }
    } else {
      console.log('⚠️ No flights found, but API connection appears to be working');
    }
    
    // Test 2: Get flight deals
    console.log('\n📋 TEST 2: FLIGHT DEALS');
    console.log('Getting flight deals from JFK...');
    
    const dealResults = await amadeusService.getFlightInspiration('JFK');
    
    if (dealResults.length > 0) {
      console.log('✅ SUCCESS! Found flight deals:');
      console.log(`   Found ${dealResults.length} deals`);
      
      // Display a few deals
      console.log('\n📊 Sample Deals:');
      dealResults.slice(0, 3).forEach((deal, index) => {
        console.log(`   ${index + 1}. ${deal.origin} to ${deal.destination}: $${deal.price.amount} on ${deal.departureDate}`);
      });
    } else {
      console.log('⚠️ No flight deals found, but API connection appears to be working');
    }
    
    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('The Amadeus API is configured correctly and working!');
    
  } catch (error) {
    console.error('\n❌ ERROR TESTING AMADEUS API:');
    
    if (error.response && error.response.result && error.response.result.errors) {
      // Format Amadeus API error
      const apiError = error.response.result.errors[0];
      console.error(`   Status: ${error.response.statusCode}`);
      console.error(`   Code: ${apiError.code}`);
      console.error(`   Title: ${apiError.title}`);
      console.error(`   Detail: ${apiError.detail}`);
      
      // Common solutions based on error code
      console.log('\n🔍 POSSIBLE SOLUTIONS:');
      
      if (error.response.statusCode === 401) {
        console.log('1. Your API key or secret may be incorrect');
        console.log('2. Your Amadeus account may not be activated yet');
        console.log('3. You may not have access to the requested API');
      } else if (apiError.code === 38187) {
        console.log('1. Check that your route parameters are valid (origin/destination)');
        console.log('2. The specified airports may not have direct routes between them');
      } else {
        console.log('1. Check your parameters for correctness');
        console.log('2. Verify your Amadeus account has necessary permissions');
        console.log('3. Try different dates or routes');
      }
    } else {
      // Handle non-Amadeus errors
      console.error(`   Message: ${error.message}`);
      
      if (error.stack) {
        console.error('   Stack:', error.stack);
      }
      
      console.log('\n🔍 POSSIBLE SOLUTIONS:');
      console.log('1. Check your internet connection');
      console.log('2. Verify the Amadeus package is installed (npm install amadeus)');
      console.log('3. Make sure environment variables are properly set');
      
      // Special handling for missing logger
      if (error.message.includes('logger')) {
        console.log('4. The logger module may be missing - check if utils/logger.js exists');
      }
    }
  }
}

// Run the test
testAmadeusAPI();