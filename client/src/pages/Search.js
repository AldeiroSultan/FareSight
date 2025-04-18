// Enhanced version of client/src/pages/Search.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FlightAPI } from '../utils/apiClient'; // Import our new API client
import FlightSearchForm from '../components/search/FlightSearchForm';
import SearchTips from '../components/search/SearchTips';

const Search = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [airports, setAirports] = useState([
    // Sample airports for initial functionality
    { code: 'JFK', name: 'New York John F. Kennedy International' },
    { code: 'LAX', name: 'Los Angeles International' },
    { code: 'SFO', name: 'San Francisco International' },
    { code: 'ORD', name: 'Chicago O\'Hare International' },
    { code: 'LHR', name: 'London Heathrow' },
    { code: 'CDG', name: 'Paris Charles de Gaulle' },
    { code: 'FRA', name: 'Frankfurt am Main' },
    { code: 'AMS', name: 'Amsterdam Schiphol' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Parse URL params for form initial values
  const initialFormData = {
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    departureDate: searchParams.get('departureDate') || '',
    returnDate: searchParams.get('returnDate') || '',
    passengers: searchParams.get('passengers') ? parseInt(searchParams.get('passengers'), 10) : 1,
    tripType: searchParams.get('returnDate') ? 'roundTrip' : 'oneWay'
  };
  
  // Check if there are any parameters in the URL
  const hasParams = searchParams.toString().length > 0;
  
  // Fetch airports and process auto-search if params exist
  useEffect(() => {
    const fetchAirportsAndSearch = async () => {
      try {
        // In a real implementation, fetch airports from your API
        // For now we'll just use the sample airports initialized above
        
        // If the search params are present, automatically redirect to search results
        if (hasParams && 
            initialFormData.origin && 
            initialFormData.destination && 
            initialFormData.departureDate) {
          await handleSearch(initialFormData);
        }
      } catch (err) {
        console.error('Error initializing search:', err);
        setError('Failed to initialize search. Please try again.');
      }
    };
    
    fetchAirportsAndSearch();
  }, []);
  
  const handleSearch = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query params
      const params = new URLSearchParams();
      params.append('origin', formData.origin);
      params.append('destination', formData.destination);
      params.append('departureDate', formData.departureDate);
      
      if (formData.tripType === 'roundTrip' && formData.returnDate) {
        params.append('returnDate', formData.returnDate);
      }
      
      params.append('passengers', formData.passengers.toString());
      
      // Navigate to search results page with the query params
      navigate({
        pathname: '/search/results',
        search: params.toString()
      });
    } catch (err) {
      console.error('Error navigating to search results:', err);
      setError('An error occurred while processing your search. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Search Flights</h1>
        <p className="text-gray-600">Find the best deals and set up price alerts.</p>
        {error && (
          <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <FlightSearchForm 
          onSubmit={handleSearch} 
          airports={airports}
          initialValues={initialFormData}
          loading={loading}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SearchTips />
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-4">
            Why Track Flight Prices?
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <svg 
                className="flex-shrink-0 h-5 w-5 text-blue-600 mt-1" 
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
              <span className="ml-2">
                <strong>Save Money:</strong> Flight prices fluctuate constantly. Track prices to buy at the right time.
              </span>
            </li>
            <li className="flex items-start">
              <svg 
                className="flex-shrink-0 h-5 w-5 text-blue-600 mt-1" 
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
              <span className="ml-2">
                <strong>Mistake Fares:</strong> Airlines occasionally publish fares far below normal prices. We'll alert you!
              </span>
            </li>
            <li className="flex items-start">
              <svg 
                className="flex-shrink-0 h-5 w-5 text-blue-600 mt-1" 
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
              <span className="ml-2">
                <strong>Price Patterns:</strong> Understand seasonal trends with historical price data.
              </span>
            </li>
            <li className="flex items-start">
              <svg 
                className="flex-shrink-0 h-5 w-5 text-blue-600 mt-1" 
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
              <span className="ml-2">
                <strong>Email Alerts:</strong> Get notified instantly when prices drop below your threshold.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Search;