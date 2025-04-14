// client/src/components/search/FlightSearchForm.js
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { formatDate } from '../../utils/api';

const FlightSearchForm = ({ onSubmit, airports = [], initialValues = {}, loading = false }) => {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureDate: null,
    returnDate: null,
    passengers: 1,
    tripType: 'oneWay',
    ...initialValues
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [originOptions, setOriginOptions] = useState([]);
  const [destinationOptions, setDestinationOptions] = useState([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  
  // Convert string dates to Date objects
  useEffect(() => {
    if (initialValues) {
      const updatedFormData = { ...formData };
      
      if (initialValues.departureDate) {
        updatedFormData.departureDate = new Date(initialValues.departureDate);
      }
      
      if (initialValues.returnDate) {
        updatedFormData.returnDate = new Date(initialValues.returnDate);
        updatedFormData.tripType = 'roundTrip';
      }
      
      setFormData(updatedFormData);
    }
  }, [initialValues]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear the related error when a field is updated
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle date changes
  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
    
    // Clear the related error when a field is updated
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  // Handle trip type change
  const handleTripTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      tripType: type,
      returnDate: type === 'oneWay' ? null : prev.returnDate
    }));
  };
  
  // Handle passenger count change
  const handlePassengerChange = (increment) => {
    setFormData(prev => ({
      ...prev,
      passengers: Math.max(1, Math.min(9, prev.passengers + increment))
    }));
  };
  
  // Handle airport search
  const handleAirportSearch = (e, field) => {
    const value = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (value.length >= 2) {
      const filtered = airports.filter(airport => 
        airport.code.toLowerCase().includes(value.toLowerCase()) || 
        airport.name.toLowerCase().includes(value.toLowerCase())
      );
      
      if (field === 'origin') {
        setOriginOptions(filtered);
        setShowOriginDropdown(true);
      } else {
        setDestinationOptions(filtered);
        setShowDestinationDropdown(true);
      }
    } else {
      if (field === 'origin') {
        setShowOriginDropdown(false);
      } else {
        setShowDestinationDropdown(false);
      }
    }
    
    // Clear the related error when a field is updated
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  // Handle airport selection
  const handleAirportSelect = (airport, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: airport.code
    }));
    
    if (field === 'origin') {
      setShowOriginDropdown(false);
    } else {
      setShowDestinationDropdown(false);
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.origin) {
      errors.origin = 'Origin is required';
    }
    
    if (!formData.destination) {
      errors.destination = 'Destination is required';
    } else if (formData.destination === formData.origin) {
      errors.destination = 'Destination cannot be the same as origin';
    }
    
    if (!formData.departureDate) {
      errors.departureDate = 'Departure date is required';
    }
    
    if (formData.tripType === 'roundTrip' && !formData.returnDate) {
      errors.returnDate = 'Return date is required for round trip';
    }
    
    if (formData.tripType === 'roundTrip' && 
        formData.departureDate && 
        formData.returnDate && 
        formData.returnDate < formData.departureDate) {
      errors.returnDate = 'Return date cannot be earlier than departure date';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        departureDate: formData.departureDate ? formatDate(formData.departureDate) : '',
        returnDate: formData.returnDate ? formatDate(formData.returnDate) : ''
      });
    }
  };
  
  // Calculate min dates for datepickers
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Trip Type Selection */}
        <div className="flex items-center space-x-4">
          <div 
            className={`px-4 py-2 rounded-md cursor-pointer ${
              formData.tripType === 'oneWay' 
                ? 'bg-blue-100 text-blue-800 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => handleTripTypeChange('oneWay')}
          >
            One Way
          </div>
          <div 
            className={`px-4 py-2 rounded-md cursor-pointer ${
              formData.tripType === 'roundTrip' 
                ? 'bg-blue-100 text-blue-800 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => handleTripTypeChange('roundTrip')}
          >
            Round Trip
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Origin Input */}
          <div className="relative">
            <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
              Origin
            </label>
            <input
              type="text"
              id="origin"
              name="origin"
              placeholder="City or airport code"
              value={formData.origin}
              onChange={(e) => handleAirportSearch(e, 'origin')}
              onFocus={() => setShowOriginDropdown(formData.origin.length >= 2)}
              onBlur={() => setTimeout(() => setShowOriginDropdown(false), 200)}
              className={`w-full p-3 border ${
                formErrors.origin ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {formErrors.origin && (
              <p className="mt-1 text-sm text-red-600">{formErrors.origin}</p>
            )}
            
            {/* Origin Dropdown */}
            {showOriginDropdown && originOptions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 max-h-60 overflow-auto">
                {originOptions.map((airport) => (
                  <div
                    key={airport.code}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleAirportSelect(airport, 'origin')}
                  >
                    <div className="font-medium">{airport.code}</div>
                    <div className="text-sm text-gray-600">{airport.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Destination Input */}
          <div className="relative">
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
              Destination
            </label>
            <input
              type="text"
              id="destination"
              name="destination"
              placeholder="City or airport code"
              value={formData.destination}
              onChange={(e) => handleAirportSearch(e, 'destination')}
              onFocus={() => setShowDestinationDropdown(formData.destination.length >= 2)}
              onBlur={() => setTimeout(() => setShowDestinationDropdown(false), 200)}
              className={`w-full p-3 border ${
                formErrors.destination ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {formErrors.destination && (
              <p className="mt-1 text-sm text-red-600">{formErrors.destination}</p>
            )}
            
            {/* Destination Dropdown */}
            {showDestinationDropdown && destinationOptions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 max-h-60 overflow-auto">
                {destinationOptions.map((airport) => (
                  <div
                    key={airport.code}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleAirportSelect(airport, 'destination')}
                  >
                    <div className="font-medium">{airport.code}</div>
                    <div className="text-sm text-gray-600">{airport.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Departure Date */}
          <div>
            <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 mb-1">
              Departure Date
            </label>
            <DatePicker
              id="departureDate"
              selected={formData.departureDate}
              onChange={(date) => handleDateChange(date, 'departureDate')}
              minDate={today}
              placeholderText="Select departure date"
              className={`w-full p-3 border ${
                formErrors.departureDate ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              dateFormat="MMMM d, yyyy"
            />
            {formErrors.departureDate && (
              <p className="mt-1 text-sm text-red-600">{formErrors.departureDate}</p>
            )}
          </div>
          
          {/* Return Date (only for round trip) */}
          <div>
            <label 
              htmlFor="returnDate" 
              className={`block text-sm font-medium ${
                formData.tripType === 'oneWay' ? 'text-gray-400' : 'text-gray-700'
              } mb-1`}
            >
              Return Date
            </label>
            <DatePicker
              id="returnDate"
              selected={formData.returnDate}
              onChange={(date) => handleDateChange(date, 'returnDate')}
              minDate={formData.departureDate || tomorrow}
              placeholderText={formData.tripType === 'oneWay' ? 'One way trip' : 'Select return date'}
              className={`w-full p-3 border ${
                formErrors.returnDate ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                formData.tripType === 'oneWay' ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              dateFormat="MMMM d, yyyy"
              disabled={formData.tripType === 'oneWay'}
            />
            {formErrors.returnDate && (
              <p className="mt-1 text-sm text-red-600">{formErrors.returnDate}</p>
            )}
          </div>
        </div>
        
        {/* Passengers */}
        <div>
          <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 mb-1">
            Passengers
          </label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handlePassengerChange(-1)}
              className="px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              -
            </button>
            <input
              type="text"
              readOnly
              value={formData.passengers}
              className="w-16 py-2 px-3 text-center border-t border-b border-gray-300 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handlePassengerChange(1)}
              className="px-3 py-2 border border-gray-300 rounded-r-md bg-gray-50 text-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              +
            </button>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 font-medium text-sm"
          >
            {loading ? (
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
                Searching...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg 
                  className="mr-2 h-5 w-5" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                    clipRule="evenodd" 
                  />
                </svg>
                Search Flights
              </div>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default FlightSearchForm;