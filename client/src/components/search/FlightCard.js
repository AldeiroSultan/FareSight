// client/src/components/search/FlightCard.js
import React, { useState } from 'react';
import { formatCurrency, formatDuration, formatDateTime } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAlerts } from '../../contexts/AlertContext';

const FlightCard = ({ flight, isExpanded, onToggleDetails, tripType }) => {
  const navigate = useNavigate();
  const { createAlert } = useAlerts();
  const [bookingUrl, setBookingUrl] = useState('');
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertError, setAlertError] = useState(null);
  
  // Process flight data based on API format
  const processFlightData = () => {
    if (flight.itineraries) {
      // Amadeus API format
      const outboundItinerary = flight.itineraries[0];
      const returnItinerary = tripType === 'roundTrip' && flight.itineraries.length > 1
        ? flight.itineraries[1]
        : null;
      
      const outboundSegments = outboundItinerary.segments;
      const returnSegments = returnItinerary ? returnItinerary.segments : [];
      
      return {
        id: flight.id,
        price: flight.price.amount,
        currency: flight.price.currency,
        airlines: flight.validatingAirlineCodes || [],
        outbound: {
          duration: outboundItinerary.duration,
          segments: outboundSegments.map(segment => ({
            departure: {
              airport: segment.departure.iataCode,
              time: new Date(segment.departure.at),
              terminal: segment.departure.terminal
            },
            arrival: {
              airport: segment.arrival.iataCode,
              time: new Date(segment.arrival.at),
              terminal: segment.arrival.terminal
            },
            airline: segment.carrierCode,
            flightNumber: `${segment.carrierCode}${segment.number}`,
            aircraft: segment.aircraft?.code,
            duration: segment.duration,
            stops: segment.stops || 0
          }))
        },
        return: returnItinerary ? {
          duration: returnItinerary.duration,
          segments: returnSegments.map(segment => ({
            departure: {
              airport: segment.departure.iataCode,
              time: new Date(segment.departure.at),
              terminal: segment.departure.terminal
            },
            arrival: {
              airport: segment.arrival.iataCode,
              time: new Date(segment.arrival.at),
              terminal: segment.arrival.terminal
            },
            airline: segment.carrierCode,
            flightNumber: `${segment.carrierCode}${segment.number}`,
            aircraft: segment.aircraft?.code,
            duration: segment.duration,
            stops: segment.stops || 0
          }))
        } : null
      };
    } else {
      // Scraped flight format
      return {
        id: flight.id || `${flight.airline}${flight.flightNumber}`,
        price: flight.price.amount,
        currency: flight.price.currency,
        airlines: [flight.airline],
        outbound: {
          duration: flight.duration,
          segments: [{
            departure: {
              airport: flight.departure.airport,
              time: new Date(`${flight.departure.date}T${flight.departure.time}`),
              terminal: null
            },
            arrival: {
              airport: flight.arrival.airport,
              time: new Date(`${flight.arrival.date}T${flight.arrival.time}`),
              terminal: null
            },
            airline: flight.airline,
            flightNumber: flight.flightNumber,
            duration: flight.duration,
            stops: flight.stops || 0
          }]
        },
        return: null // Scraped data might not include return details
      };
    }
  };
  
  const flightData = processFlightData();
  
  // Get airline name
  const getAirlineName = (code) => {
    const airlines = {
      'AA': 'American Airlines',
      'DL': 'Delta Air Lines',
      'UA': 'United Airlines',
      'LH': 'Lufthansa',
      'BA': 'British Airways',
      'AF': 'Air France',
      'KL': 'KLM',
      'EK': 'Emirates',
      'QR': 'Qatar Airways',
      'SQ': 'Singapore Airlines',
      'B6': 'JetBlue',
      'WN': 'Southwest Airlines',
      'AS': 'Alaska Airlines',
      'F9': 'Frontier Airlines',
      'NK': 'Spirit Airlines',
      'HA': 'Hawaiian Airlines',
      'AC': 'Air Canada',
      'WS': 'WestJet',
      'IB': 'Iberia',
      'AY': 'Finnair',
      'TK': 'Turkish Airlines',
      'EY': 'Etihad Airways',
      'CX': 'Cathay Pacific',
      'JL': 'Japan Airlines',
      'NH': 'ANA',
      'OZ': 'Asiana Airlines',
      'KE': 'Korean Air',
      'CZ': 'China Southern',
      'MU': 'China Eastern',
      'CA': 'Air China',
      'ET': 'Ethiopian Airlines',
      'SA': 'South African Airways',
      'LA': 'LATAM Airlines',
      'AM': 'Aeromexico',
      'AV': 'Avianca',
      'CM': 'Copa Airlines'
    };
    
    return airlines[code] || code;
  };
  
  // Get airline logo URL
  const getAirlineLogo = (code) => {
    return `/images/airlines/${code.toLowerCase()}.png`;
  };
  
  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };
  
  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  // Calculate total stops
  const getTotalStops = (segments) => {
    if (segments.length === 1) {
      return segments[0].stops;
    }
    return segments.length - 1 + segments.reduce((total, segment) => total + (segment.stops || 0), 0);
  };
  
  // Calculate layover time
  const calculateLayoverTime = (arrivalTime, departureTime) => {
    const diff = Math.round((departureTime - arrivalTime) / (1000 * 60));
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
  };
  
  // Handle booking
  const handleBooking = () => {
    // In a real application, this would redirect to a booking page or partner website
    // For demonstration purposes, we'll just show a URL
    
    const airline = flightData.airlines[0];
    const bookingLinks = {
      'AA': 'https://www.aa.com',
      'DL': 'https://www.delta.com',
      'UA': 'https://www.united.com',
      'LH': 'https://www.lufthansa.com',
      'BA': 'https://www.britishairways.com',
      'default': 'https://www.expedia.com'
    };
    
    const url = bookingLinks[airline] || bookingLinks.default;
    setBookingUrl(url);
    
    // Open in new tab
    window.open(url, '_blank');
  };
  
  // Handle create alert
  const handleCreateAlert = async () => {
    try {
      setIsCreatingAlert(true);
      setAlertError(null);
      setAlertSuccess(false);
      
      // Extract route information
      const originCode = flightData.outbound.segments[0].departure.airport;
      const destinationCode = flightData.outbound.segments[flightData.outbound.segments.length - 1].arrival.airport;
      const departureDate = flightData.outbound.segments[0].departure.time.toISOString().split('T')[0];
      const returnDate = flightData.return 
        ? flightData.return.segments[0].departure.time.toISOString().split('T')[0]
        : null;
      
      // Set price threshold 10% below current price
      const priceThreshold = Math.floor(flightData.price * 0.9);
      
      const alertData = {
        origin: originCode,
        destination: destinationCode,
        departureDate,
        returnDate,
        priceThreshold
      };
      
      const result = await createAlert(alertData);
      
      if (result) {
        setAlertSuccess(true);
        setTimeout(() => {
          setAlertSuccess(false);
        }, 5000);
      } else {
        setAlertError('Failed to create alert. Please try again.');
      }
    } catch (err) {
      console.error('Error creating alert:', err);
      setAlertError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsCreatingAlert(false);
    }
  };
  
  // Get outbound details
  const outbound = flightData.outbound;
  const outboundFirstSegment = outbound.segments[0];
  const outboundLastSegment = outbound.segments[outbound.segments.length - 1];
  const outboundStops = getTotalStops(outbound.segments);
  
  // Get return details (if applicable)
  const returnFlight = flightData.return;
  const returnFirstSegment = returnFlight?.segments[0];
  const returnLastSegment = returnFlight?.segments[returnFlight?.segments.length - 1];
  const returnStops = returnFlight ? getTotalStops(returnFlight.segments) : 0;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Main Flight Card */}
      <div className="p-4">
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Airline */}
          <div className="col-span-2">
            <div className="flex flex-col items-center">
              <div className="mb-2">
                <img 
                  src={getAirlineLogo(flightData.airlines[0])}
                  alt={getAirlineName(flightData.airlines[0])}
                  className="h-8 w-auto"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/airlines/default.png';
                  }}
                />
              </div>
              <div className="text-sm font-medium">
                {getAirlineName(flightData.airlines[0])}
              </div>
              <div className="text-xs text-gray-500">
                {outboundFirstSegment.flightNumber}
                {outbound.segments.length > 1 && '+'}
              </div>
            </div>
          </div>
          
          {/* Departure */}
          <div className="col-span-2">
            <div className="font-medium">
              {formatTime(outboundFirstSegment.departure.time)}
            </div>
            <div className="text-sm">
              {outboundFirstSegment.departure.airport}
              {outboundFirstSegment.departure.terminal && ` (T${outboundFirstSegment.departure.terminal})`}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(outboundFirstSegment.departure.time)}
            </div>
          </div>
          
          {/* Flight Path */}
          <div className="col-span-3">
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-1">
                {formatDuration(outbound.duration)}
              </div>
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="h-0.5 w-full bg-gray-200"></div>
                </div>
                <div className="relative flex justify-between">
                  <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  
                  {outboundStops > 0 && (
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-gray-400 mb-1"></div>
                      <div className="text-xs text-gray-500">
                        {outboundStops} {outboundStops === 1 ? 'stop' : 'stops'}
                      </div>
                    </div>
                  )}
                  
                  <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                </div>
              </div>
              {outbound.segments.length > 1 && (
                <div className="mt-1 text-xs text-gray-500">
                  {outbound.segments.map((segment, index) => {
                    if (index < outbound.segments.length - 1) {
                      return (
                        <span key={index}>
                          {segment.arrival.airport}
                          {index < outbound.segments.length - 2 ? ', ' : ''}
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Arrival */}
          <div className="col-span-2">
            <div className="font-medium">
              {formatTime(outboundLastSegment.arrival.time)}
            </div>
            <div className="text-sm">
              {outboundLastSegment.arrival.airport}
              {outboundLastSegment.arrival.terminal && ` (T${outboundLastSegment.arrival.terminal})`}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(outboundLastSegment.arrival.time)}
            </div>
          </div>
          
          {/* Price and Book */}
          <div className="col-span-3 text-right">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(flightData.price, flightData.currency)}
            </div>
            <div className="mt-2 space-x-2">
              <button
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={onToggleDetails}
              >
                {isExpanded ? 'Hide details' : 'View details'}
              </button>
              <button 
                className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleBooking}
              >
                Select
              </button>
            </div>
          </div>
        </div>
        
        {/* Return Flight (if applicable) */}
        {returnFlight && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-12 gap-4 items-center">
            {/* Airline */}
            <div className="col-span-2">
              <div className="flex flex-col items-center">
                <div className="mb-2">
                  <img 
                    src={getAirlineLogo(returnFirstSegment.airline)}
                    alt={getAirlineName(returnFirstSegment.airline)}
                    className="h-8 w-auto"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/airlines/default.png';
                    }}
                  />
                </div>
                <div className="text-sm font-medium">
                  {getAirlineName(returnFirstSegment.airline)}
                </div>
                <div className="text-xs text-gray-500">
                  {returnFirstSegment.flightNumber}
                  {returnFlight.segments.length > 1 && '+'}
                </div>
              </div>
            </div>
            
            {/* Departure */}
            <div className="col-span-2">
              <div className="font-medium">
                {formatTime(returnFirstSegment.departure.time)}
              </div>
              <div className="text-sm">
                {returnFirstSegment.departure.airport}
                {returnFirstSegment.departure.terminal && ` (T${returnFirstSegment.departure.terminal})`}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(returnFirstSegment.departure.time)}
              </div>
            </div>
            
            {/* Flight Path */}
            <div className="col-span-3">
              <div className="flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-1">
                  {formatDuration(returnFlight.duration)}
                </div>
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <div className="h-0.5 w-full bg-gray-200"></div>
                  </div>
                  <div className="relative flex justify-between">
                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                    
                    {returnStops > 0 && (
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-gray-400 mb-1"></div>
                        <div className="text-xs text-gray-500">
                          {returnStops} {returnStops === 1 ? 'stop' : 'stops'}
                        </div>
                      </div>
                    )}
                    
                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  </div>
                </div>
                {returnFlight.segments.length > 1 && (
                  <div className="mt-1 text-xs text-gray-500">
                    {returnFlight.segments.map((segment, index) => {
                      if (index < returnFlight.segments.length - 1) {
                        return (
                          <span key={index}>
                            {segment.arrival.airport}
                            {index < returnFlight.segments.length - 2 ? ', ' : ''}
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Arrival */}
            <div className="col-span-2">
              <div className="font-medium">
                {formatTime(returnLastSegment.arrival.time)}
              </div>
              <div className="text-sm">
                {returnLastSegment.arrival.airport}
                {returnLastSegment.arrival.terminal && ` (T${returnLastSegment.arrival.terminal})`}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(returnLastSegment.arrival.time)}
              </div>
            </div>
            
            <div className="col-span-3 text-right">
              <div className="text-sm font-medium text-gray-500">Return flight</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="space-y-6">
            {/* Action buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCreateAlert}
                disabled={isCreatingAlert}
                className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingAlert ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating alert...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    Create Price Alert
                  </>
                )}
              </button>
              
              <button
                onClick={handleBooking}
                className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Book this flight
              </button>
            </div>
            
            {/* Alert feedback */}
            {alertSuccess && (
              <div className="p-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                Price alert created successfully! We'll notify you when the price drops.
              </div>
            )}
            
            {alertError && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {alertError}
              </div>
            )}
            
            {/* Outbound Journey Details */}
            <div>
              <h3 className="text-lg font-medium mb-3">
                {outboundFirstSegment.departure.airport} to {outboundLastSegment.arrival.airport}
              </h3>
              
              <div className="space-y-4">
                {outbound.segments.map((segment, index) => (
                  <div key={index} className="flex">
                    {/* Timeline */}
                    <div className="flex flex-col items-center mr-4">
                      <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                      {index < outbound.segments.length - 1 && (
                        <div className="h-full w-0.5 bg-gray-300 my-1"></div>
                      )}
                    </div>
                    
                    {/* Segment Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">
                            {formatTime(segment.departure.time)} • {segment.departure.airport}
                            {segment.departure.terminal && ` Terminal ${segment.departure.terminal}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(segment.departure.time)}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm">
                            Flight {segment.flightNumber}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getAirlineName(segment.airline)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="my-2 text-xs text-gray-500 flex items-center">
                        <svg className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        {formatDuration(segment.duration)}
                        
                        {segment.aircraft && (
                          <span className="ml-3 flex items-center">
                            <svg className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11.43a1 1 0 01.725-.962l5-1.429a1 1 0 001.17-1.409l-7-14z" />
                            </svg>
                            {segment.aircraft}
                          </span>
                        )}
                      </div>
                      
                      {index < outbound.segments.length - 1 && (
                        <div className="my-2 px-3 py-2 bg-gray-100 rounded-md">
                          <div className="text-sm font-medium">
                            Connection in {segment.arrival.airport}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(() => {
                              const arrivalTime = segment.arrival.time;
                              const departureTime = outbound.segments[index + 1].departure.time;
                              const diff = Math.round((departureTime - arrivalTime) / (1000 * 60));
                              const hours = Math.floor(diff / 60);
                              const minutes = diff % 60;
                              
                              return `Connection time: ${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
                            })()}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mt-2">
                        <div>
                          <div className="font-medium">
                            {formatTime(segment.arrival.time)} • {segment.arrival.airport}
                            {segment.arrival.terminal && ` Terminal ${segment.arrival.terminal}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(segment.arrival.time)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Return Journey Details */}
            {returnFlight && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-3">
                  {returnFirstSegment.departure.airport} to {returnLastSegment.arrival.airport}
                </h3>
                
                <div className="space-y-4">
                  {returnFlight.segments.map((segment, index) => (
                    <div key={index} className="flex">
                      {/* Timeline */}
                      <div className="flex flex-col items-center mr-4">
                        <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                        {index < returnFlight.segments.length - 1 && (
                          <div className="h-full w-0.5 bg-gray-300 my-1"></div>
                        )}
                      </div>
                      
                      {/* Segment Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {formatTime(segment.departure.time)} • {segment.departure.airport}
                              {segment.departure.terminal && ` Terminal ${segment.departure.terminal}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(segment.departure.time)}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm">
                              Flight {segment.flightNumber}
                            </div>
                            <div className="text-xs text-gray-500">
                              {getAirlineName(segment.airline)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="my-2 text-xs text-gray-500 flex items-center">
                          <svg className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          {formatDuration(segment.duration)}
                          
                          {segment.aircraft && (
                            <span className="ml-3 flex items-center">
                              <svg className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11.43a1 1 0 01.725-.962l5-1.429a1 1 0 001.17-1.409l-7-14z" />
                              </svg>
                              {segment.aircraft}
                            </span>
                          )}
                        </div>
                        
                        {index < returnFlight.segments.length - 1 && (
                          <div className="my-2 px-3 py-2 bg-gray-100 rounded-md">
                            <div className="text-sm font-medium">
                              Connection in {segment.arrival.airport}
                            </div>
                            <div className="text-xs text-gray-500">
                              {(() => {
                                const arrivalTime = segment.arrival.time;
                                const departureTime = returnFlight.segments[index + 1].departure.time;
                                const diff = Math.round((departureTime - arrivalTime) / (1000 * 60));
                                const hours = Math.floor(diff / 60);
                                const minutes = diff % 60;
                                
                                return `Connection time: ${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
                              })()}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-start mt-2">
                          <div>
                            <div className="font-medium">
                              {formatTime(segment.arrival.time)} • {segment.arrival.airport}
                              {segment.arrival.terminal && ` Terminal ${segment.arrival.terminal}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(segment.arrival.time)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Price Breakdown */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-3">Price Details</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base fare</span>
                  <span>{formatCurrency(Math.round(flightData.price * 0.85), flightData.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes and fees</span>
                  <span>{formatCurrency(Math.round(flightData.price * 0.15), flightData.currency)}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatCurrency(flightData.price, flightData.currency)}</span>
                </div>
              </div>
            </div>
            
            {/* Fare rules */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-3">Fare Rules</h3>
              
              <div className="space-y-2">
                <div className="flex">
                  <svg className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <strong>Baggage:</strong> 1 carry-on bag included. First checked bag may incur a fee.
                  </span>
                </div>
                <div className="flex">
                  <svg className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <strong>Cancellation:</strong> Cancellation fee may apply.
                  </span>
                </div>
                <div className="flex">
                  <svg className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <strong>Changes:</strong> Change fee may apply plus fare difference.
                  </span>
                </div>
                <div className="flex">
                  <svg className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <strong>Seat selection:</strong> Seat selection may incur additional fees.
                  </span>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  *Fare rules are provided for information only and are subject to change. Please check with the airline for the most up-to-date information.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightCard;