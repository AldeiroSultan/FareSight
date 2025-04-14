// client/src/components/dashboard/FlightDeals.js
import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDateOnly } from '../../utils/api';

const FlightDeals = ({ deals }) => {
  if (!deals || deals.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 h-full">
        <h2 className="text-xl font-semibold mb-4">Flight Deals</h2>
        <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center h-full">
          <p className="text-gray-500 text-center">No deals available right now. Check back later!</p>
        </div>
      </div>
    );
  }

  // Sort deals by price
  const sortedDeals = [...deals].sort((a, b) => a.price.amount - b.price.amount);
  
  // Take top 5 deals
  const topDeals = sortedDeals.slice(0, 5);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 h-full">
      <h2 className="text-xl font-semibold mb-4">Top Flight Deals</h2>
      <div className="space-y-4">
        {topDeals.map((deal, index) => (
          <Link 
            key={`${deal.destination}-${index}`}
            to={`/search?origin=${deal.origin || 'JFK'}&destination=${deal.destination}&departureDate=${deal.departureDate}${deal.returnDate ? `&returnDate=${deal.returnDate}` : ''}`}
            className="block border border-gray-200 rounded-md p-3 hover:bg-blue-50 transition-colors duration-150"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">
                  {deal.origin || 'JFK'} → {deal.destination}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {formatDateOnly(deal.departureDate)}
                  {deal.returnDate && ` - ${formatDateOnly(deal.returnDate)}`}
                </div>
              </div>
              <div className="font-semibold text-lg text-blue-600">
                {formatCurrency(deal.price.amount)}
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {deals.length > 5 && (
        <div className="mt-4 text-center">
          <Link 
            to="/search" 
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View More Deals →
          </Link>
        </div>
      )}
    </div>
  );
};

export default FlightDeals;