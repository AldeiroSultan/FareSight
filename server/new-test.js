// server/new-test.js
console.log('Loading amadeus-test module...');
const amadeusTest = require('./amadeus-test');

console.log('Module loaded. Available properties:');
for (const prop in amadeusTest) {
  console.log(`- ${prop}: ${typeof amadeusTest[prop]}`);
}

async function runTest() {
  try {
    console.log('\nTesting searchFlightOffers function...');
    const flights = await amadeusTest.searchFlightOffers('JFK', 'LAX', '2025-06-15');
    console.log(`Found ${flights.length} flights`);
    
    console.log('\nTesting getFlightInspiration function...');
    const deals = await amadeusTest.getFlightInspiration('JFK');
    console.log(`Found ${deals.length} deals`);
    
    console.log('\n✅ Tests successful!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

runTest();