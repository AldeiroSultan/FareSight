// client/src/components/search/SearchTips.js
import React, { useState } from 'react';

const SearchTips = () => {
  const [expandedTip, setExpandedTip] = useState(null);
  
  const tips = [
    {
      id: 'flexible-dates',
      title: 'Be Flexible with Dates',
      short: 'Flying mid-week (Tuesday/Wednesday) is typically cheaper than weekends.',
      long: 'Flight prices can vary significantly depending on the day of the week. Tuesday and Wednesday are generally the cheapest days to fly, while Friday and Sunday tend to be the most expensive. If your schedule allows for flexibility, you can often save 20-30% by adjusting your departure or return date by just a day or two.'
    },
    {
      id: 'book-advance',
      title: 'Book in Advance',
      short: 'For domestic flights, aim to book 1-3 months ahead. For international, 2-8 months ahead.',
      long: 'The sweet spot for booking domestic flights is typically 1-3 months before departure. For international flights, it\'s generally best to book 2-8 months ahead. However, this can vary by season, destination, and current demand. Last-minute deals are increasingly rare, so waiting until the last week usually results in paying premium prices.'
    },
    {
      id: 'price-alerts',
      title: 'Set Price Alerts',
      short: 'Don\'t have time to constantly check? Set alerts and we\'ll notify you when prices drop.',
      long: 'By setting up price alerts, you can monitor routes over time without constantly checking. Our system will automatically track price changes and notify you when there\'s a significant drop or when prices hit your specified threshold. This is especially useful for routes that have volatile pricing or seasonal fluctuations.'
    },
    {
      id: 'nearby-airports',
      title: 'Consider Nearby Airports',
      short: 'Sometimes flying to/from an alternative airport can save you money.',
      long: 'Major cities often have multiple airports within a reasonable distance. For example, if you\'re traveling to New York, consider all airports (JFK, LaGuardia, Newark) in your search. The difference in airfare can sometimes be hundreds of dollars, even after accounting for any additional transportation costs from a more distant airport.'
    },
    {
      id: 'clear-cookies',
      title: 'Clear Your Cookies',
      short: 'Airlines and booking sites can track your searches and may increase prices if you repeatedly check the same route.',
      long: 'Flight search engines and airline websites use cookies to track your browsing habits. Some users report seeing price increases when repeatedly searching for the same route, as the sites may interpret your frequent searches as increased interest and demand. Using private browsing mode, clearing cookies, or using different devices for your searches might help avoid this potential price manipulation.'
    },
    {
      id: 'mistake-fares',
      title: 'Look for Mistake Fares',
      short: 'Airlines occasionally publish fares far below normal prices due to errors.',
      long: 'Mistake fares (or error fares) happen when airlines accidentally publish fares at a fraction of their intended price. These can be caused by currency conversion errors, technical glitches, or human error. These deals typically don\'t last long, so quick action is essential. Our system is designed to detect and alert you to these rare opportunities.'
    },
    {
      id: 'shoulder-season',
      title: 'Travel During Shoulder Season',
      short: 'The periods just before or after peak season often offer the best value.',
      long: 'Shoulder seasons (the periods just before and after peak tourist season) often provide the perfect balance of reasonable prices and good weather/conditions. For example, visiting Europe in May or September instead of the summer months can result in significantly lower airfares and accommodation costs, while still enjoying favorable weather and avoiding the worst crowds.'
    },
    {
      id: 'hidden-city',
      title: 'Hidden City Ticketing (Use Caution)',
      short: 'Sometimes a flight with a connection is cheaper than a direct flight to your destination.',
      long: 'Hidden city ticketing is when you book a flight with a connection, but your actual destination is the connecting city. For example, if a flight from New York to Chicago is $400, but a flight from New York to Denver with a stopover in Chicago is $250, you could book the Denver flight but exit at Chicago. IMPORTANT: This violates most airlines\' terms of service and comes with risks: you can\'t check bags, it only works for one-way trips, and airlines may penalize you if they detect a pattern.'
    }
  ];
  
  const toggleTip = (id) => {
    setExpandedTip(expandedTip === id ? null : id);
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-green-800 mb-4">
        Flight Booking Tips
      </h2>
      <ul className="space-y-4">
        {tips.map(tip => (
          <li key={tip.id} className="space-y-1">
            <div className="flex items-start">
              <svg 
                className="flex-shrink-0 h-5 w-5 text-green-600 mt-1" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                  clipRule="evenodd" 
                />
              </svg>
              <div className="ml-2">
                <div className="font-medium text-green-800 flex items-center">
                  {tip.title}
                  <button 
                    onClick={() => toggleTip(tip.id)}
                    className="ml-2 text-green-600 hover:text-green-800 focus:outline-none"
                    aria-label={expandedTip === tip.id ? "Collapse details" : "Expand details"}
                  >
                    {expandedTip === tip.id ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-700">
                  {expandedTip === tip.id ? tip.long : tip.short}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      
      <div className="mt-6 text-center">
        <a 
          href="#" 
          className="text-sm text-green-600 hover:text-green-800 underline"
          onClick={(e) => {
            e.preventDefault();
            window.open('/blog/flight-booking-tips', '_blank');
          }}
        >
          Read more tips in our flight booking guide
        </a>
      </div>
    </div>
  );
};

export default SearchTips;