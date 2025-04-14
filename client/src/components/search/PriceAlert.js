// client/src/components/search/PriceAlert.js
import React, { useState } from 'react';
import { useAlerts } from '../../contexts/AlertContext';
import { formatCurrency } from '../../utils/api';

const PriceAlert = ({ origin, destination, departureDate, returnDate, lowestPrice }) => {
  const [priceThreshold, setPriceThreshold] = useState(
    lowestPrice ? Math.floor(lowestPrice * 0.9) : 0
  );
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const { createAlert } = useAlerts();
  
  // Update threshold when lowest price changes
  React.useEffect(() => {
    if (lowestPrice) {
      setPriceThreshold(Math.floor(lowestPrice * 0.9));
    }
  }, [lowestPrice]);
  
  // Handle slider change
  const handleSliderChange = (e) => {
    setPriceThreshold(Number(e.target.value));
  };
  
  // Handle alert creation
  const handleCreateAlert = async () => {
    if (!origin || !destination || !departureDate) {
      setError('Missing required route information');
      return;
    }
    
    setIsCreating(true);
    setError(null);
    setSuccess(false);
    
    try {
      const alertData = {
        origin,
        destination,
        departureDate,
        returnDate,
        priceThreshold
      };
      
      const result = await createAlert(alertData);
      
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else {
        setError('Failed to create alert. Please try again.');
      }
    } catch (err) {
      console.error('Error creating alert:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsCreating(false);
    }
  };
  
  // Calculate relative values
  const minThreshold = lowestPrice ? Math.floor(lowestPrice * 0.7) : 0;
  const maxThreshold = lowestPrice ? Math.ceil(lowestPrice * 1.1) : 1000;
  
  // Calculate percentage below current price
  const percentBelow = lowestPrice ? ((lowestPrice - priceThreshold) / lowestPrice) * 100 : 0;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Set Price Alert</h2>
      
      <p className="text-sm text-gray-600 mb-4">
        Get notified when the price drops below your target price.
      </p>
      
      {error && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
          Price alert created successfully!
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex justify-between mb-1 items-center">
          <span className="text-sm text-gray-500">Alert Threshold</span>
          <span className="font-medium text-blue-600">
            {formatCurrency(priceThreshold)}
          </span>
        </div>
        
        <input
          type="range"
          min={minThreshold}
          max={maxThreshold}
          value={priceThreshold}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
        />
        
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">
            {formatCurrency(minThreshold)}
          </span>
          <span className="text-xs text-gray-500">
            {formatCurrency(maxThreshold)}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm">
          Current lowest price:
        </span>
        <span className="font-medium">
          {lowestPrice ? formatCurrency(lowestPrice) : 'N/A'}
        </span>
      </div>
      
      {lowestPrice > 0 && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm">
            Alert me when price is:
          </span>
          <span className="font-medium text-green-600">
            {percentBelow.toFixed(1)}% below current
          </span>
        </div>
      )}
      
      <button
        onClick={handleCreateAlert}
        disabled={isCreating || !lowestPrice}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
      >
        {isCreating ? (
          <div className="flex items-center justify-center">
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              ></circle>
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Creating...
          </div>
        ) : (
          'Create Price Alert'
        )}
      </button>
      
      <p className="mt-2 text-xs text-gray-500">
        We'll email you when the price drops below {formatCurrency(priceThreshold)}.
      </p>
    </div>
  );
};

export default PriceAlert;