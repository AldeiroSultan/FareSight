// client/src/components/search/FlightFilters.js
import React, { useState } from 'react';
import { formatCurrency } from '../../utils/api';
import RangeSlider from '../ui/RangeSlider';

const FlightFilters = ({ filters, priceRange, airlines, onChange }) => {
  const [isOpen, setIsOpen] = useState({
    price: true,
    airlines: true,
    stops: true,
    departureTime: true,
    returnTime: false
  });
  
  // Toggle filter section
  const toggleSection = (section) => {
    setIsOpen(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Handle price change
  const handlePriceChange = (values) => {
    onChange({ price: { min: values[0], max: values[1] } });
  };
  
  // Handle airline filter change
  const handleAirlineChange = (airline) => {
    const newAirlines = filters.airlines.includes(airline)
      ? filters.airlines.filter(a => a !== airline)
      : [...filters.airlines, airline];
    
    onChange({ airlines: newAirlines });
  };
  
  // Handle stops filter change
  const handleStopsChange = (stops) => {
    onChange({ stops });
  };
  
  // Handle departure time filter change
  const handleDepartureTimeChange = (time) => {
    onChange({ departureTime: time });
  };
  
  // Handle return time filter change
  const handleReturnTimeChange = (time) => {
    onChange({ returnTime: time });
  };
  
  // Reset all filters
  const resetFilters = () => {
    onChange({
      price: priceRange,
      airlines: [],
      stops: 'any',
      departureTime: 'any',
      returnTime: 'any'
    });
  };
  
  // Airline display names
  const airlineNames = {
    'AA': 'American Airlines',
    'DL': 'Delta Air Lines',
    'UA': 'United Airlines',
    'LH': 'Lufthansa',
    'BA': 'British Airways',
    'AF': 'Air France',
    'KL': 'KLM',
    'EK': 'Emirates',
    'QR': 'Qatar Airways',
    'SQ': 'Singapore Airlines'
  };
  
  // Get airline display name
  const getAirlineName = (code) => {
    return airlineNames[code] || code;
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button 
          onClick={resetFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Reset
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Price Filter */}
        <div>
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('price')}
          >
            <h3 className="font-medium">Price</h3>
            <svg 
              className={`h-5 w-5 text-gray-500 transition-transform ${isOpen.price ? 'transform rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
          
          {isOpen.price && (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">
                  {formatCurrency(filters.price.min)}
                </span>
                <span className="text-sm text-gray-500">
                  {formatCurrency(filters.price.max)}
                </span>
              </div>
              
              <RangeSlider 
                min={priceRange.min}
                max={priceRange.max}
                values={[filters.price.min, filters.price.max]}
                onChange={handlePriceChange}
              />
            </div>
          )}
        </div>
        
        {/* Airlines Filter */}
        <div>
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('airlines')}
          >
            <h3 className="font-medium">Airlines</h3>
            <svg 
              className={`h-5 w-5 text-gray-500 transition-transform ${isOpen.airlines ? 'transform rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
          
          {isOpen.airlines && (
            <div className="mt-2 space-y-2">
              {airlines.map(airline => (
                <div key={airline} className="flex items-center">
                  <input
                    id={`airline-${airline}`}
                    type="checkbox"
                    checked={filters.airlines.includes(airline)}
                    onChange={() => handleAirlineChange(airline)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`airline-${airline}`} className="ml-2 text-sm text-gray-700">
                    {getAirlineName(airline)}
                  </label>
                </div>
              ))}
              
              {airlines.length === 0 && (
                <p className="text-sm text-gray-500">No airlines available for this route.</p>
              )}
            </div>
          )}
        </div>
        
        {/* Stops Filter */}
        <div>
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('stops')}
          >
            <h3 className="font-medium">Stops</h3>
            <svg 
              className={`h-5 w-5 text-gray-500 transition-transform ${isOpen.stops ? 'transform rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
          
          {isOpen.stops && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input
                  id="stops-any"
                  type="radio"
                  checked={filters.stops === 'any'}
                  onChange={() => handleStopsChange('any')}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="stops-any" className="ml-2 text-sm text-gray-700">
                  Any number of stops
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="stops-nonstop"
                  type="radio"
                  checked={filters.stops === 'nonstop'}
                  onChange={() => handleStopsChange('nonstop')}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="stops-nonstop" className="ml-2 text-sm text-gray-700">
                  Nonstop only
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="stops-1stop"
                  type="radio"
                  checked={filters.stops === '1stop'}
                  onChange={() => handleStopsChange('1stop')}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="stops-1stop" className="ml-2 text-sm text-gray-700">
                  1 stop
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="stops-2plusStops"
                  type="radio"
                  checked={filters.stops === '2plusStops'}
                  onChange={() => handleStopsChange('2plusStops')}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="stops-2plusStops" className="ml-2 text-sm text-gray-700">
                  2+ stops
                </label>
              </div>
            </div>
          )}
        </div>
        
        {/* Departure Time Filter */}
        <div>
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('departureTime')}
          >
            <h3 className="font-medium">Departure Time</h3>
            <svg 
              className={`h-5 w-5 text-gray-500 transition-transform ${isOpen.departureTime ? 'transform rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
          
          {isOpen.departureTime && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input
                  id="departureTime-any"
                  type="radio"
                  checked={filters.departureTime === 'any'}
                  onChange={() => handleDepartureTimeChange('any')}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="departureTime-any" className="ml-2 text-sm text-gray-700">
                  Any time
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="departureTime-morning"
                  type="radio"
                  checked={filters.departureTime === 'morning'}
                  onChange={() => handleDepartureTimeChange('morning')}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="departureTime-morning" className="ml-2 text-sm text-gray-700">
                  Morning (5AM - 12PM)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="departureTime-afternoon"
                  type="radio"
                  checked={filters.departureTime === 'afternoon'}
                  onChange={() => handleDepartureTimeChange('afternoon')}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="departureTime-afternoon" className="ml-2 text-sm text-gray-700">
                  Afternoon (12PM - 6PM)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="departureTime-evening"
                  type="radio"
                  checked={filters.departureTime === 'evening'}
                  onChange={() => handleDepartureTimeChange('evening')}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="departureTime-evening" className="ml-2 text-sm text-gray-700">
                  Evening (6PM - 10PM)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="departureTime-night"
                  type="radio"
                  checked={filters.departureTime === 'night'}
                  onChange={() => handleDepartureTimeChange('night')}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="departureTime-night" className="ml-2 text-sm text-gray-700">
                  Night (10PM - 5AM)
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightFilters;