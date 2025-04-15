// check-exports.js
// Run this from your server directory with: node check-exports.js

try {
    const amadeus = require('./services/amadeus');
    
    console.log('Successfully imported the amadeus module');
    console.log('\nModule contents:');
    console.log(typeof amadeus, Object.prototype.toString.call(amadeus));
    
    console.log('\nExported properties:');
    for (const prop in amadeus) {
      console.log(`- ${prop}: ${typeof amadeus[prop]}`);
    }
    
    console.log('\nDoes it have searchFlightOffers?', 'searchFlightOffers' in amadeus);
    console.log('Does it have getFlightInspiration?', 'getFlightInspiration' in amadeus);
    
    if (typeof amadeus.default === 'object') {
      console.log('\nFound default export. Properties:');
      for (const prop in amadeus.default) {
        console.log(`- ${prop}: ${typeof amadeus.default[prop]}`);
      }
      
      console.log('\nDoes default export have searchFlightOffers?', 'searchFlightOffers' in amadeus.default);
      console.log('Does default export have getFlightInspiration?', 'getFlightInspiration' in amadeus.default);
    }
  } catch (error) {
    console.error('Error importing amadeus module:', error);
  }