// src/pages/PriceHistory.js
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';

const PriceHistory = () => {
  const [searchParams] = useSearchParams();
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract search parameters
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departureDate = searchParams.get('departureDate');
  const returnDate = searchParams.get('returnDate');

  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // This is a placeholder. In a real app, you would fetch price history from your API
        // const response = await api.get('/flights/price-history', {
        //   params: { origin, destination, departureDate, returnDate }
        // });
        
        // For now, generate mock data
        const mockPriceHistory = generateMockPriceHistory();
        setPriceHistory(mockPriceHistory);
      } catch (err) {
        console.error('Error fetching price history:', err);
        setError('Failed to load price history data');
      } finally {
        setLoading(false);
      }
    };

    if (origin && destination) {
      fetchPriceHistory();
    } else {
      setError('Please provide route information to view price history');
      setLoading(false);
    }
  }, [origin, destination, departureDate, returnDate]);

  // Generate mock price history data
  const generateMockPriceHistory = () => {
    const data = [];
    const now = new Date();
    const basePrice = 500;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      // Add some price variation
      const variance = Math.random() * 100 - 50;
      const price = Math.max(200, basePrice + variance);
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price),
        airline: ['AA', 'DL', 'UA', 'BA'][Math.floor(Math.random() * 4)]
      });
    }
    
    return data;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Price History</h1>
        {origin && destination && (
          <p className="text-gray-600">
            {origin} to {destination}
            {departureDate && ` • ${departureDate}`}
            {returnDate && ` to ${returnDate}`}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Price Trend</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <p className="text-blue-700">
              This is a placeholder for the price history chart. In a complete application, 
              this would show a line chart of historical prices.
            </p>
          </div>
          
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Airline
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {priceHistory.map((record, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${record.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.airline}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PriceHistory;