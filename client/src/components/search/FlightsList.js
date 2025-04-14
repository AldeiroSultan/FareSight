// client/src/components/search/FlightsList.js
import React, { useState } from 'react';
import { formatCurrency, formatDuration, formatDateTime } from '../../utils/api';
import FlightCard from './FlightCard';

const FlightsList = ({ 
  flights, 
  tripType, 
  origin, 
  destination, 
  departureDate, 
  returnDate 
}) => {
  const [sortOption, setSortOption] = useState('price');
  const [expandedFlight, setExpandedFlight] = useState(null);
  
  // Sort flights based on selected option
  const sortedFlights = [...flights].sort((a, b) => {
    if (sortOption === 'price') {
      return a.price.amount - b.price.amount;
    } else if (sortOption === 'duration') {
      const aDuration = a.itineraries 
        ? getTotalDuration(a.itineraries[0]) 
        : a.duration;
      const bDuration = b.itineraries 
        ? getTotalDuration(b.itineraries[0]) 
        : b.duration;
      return durationToMinutes(aDuration) - durationToMinutes(bDuration);
    } else if (sortOption === 'departureTime') {
      const aDepartureTime = a.itineraries 
        ? new Date(a.itineraries[0].segments[0].departure.at).getTime() 
        : new Date(`${a.departure.date}T${a.departure.time}`).getTime();
      const bDepartureTime = b.itineraries 
        ? new Date(b.itineraries[0].segments[0].departure.at).getTime() 
        : new Date(`${b.departure.date}T${b.departure.time}`).getTime();
      return aDepartureTime - bDepartureTime;
    } else if (sortOption === 'arrivalTime') {
      const aSegments = a.itineraries ? a.itineraries[0].segments : [a];
      const bSegments = b.itineraries ? b.itineraries[0].segments : [b];
      
      const aLastSegment = aSegments[aSegments.length - 1];
      const bLastSegment = bSegments[bSegments.length - 1];
      
      const aArrivalTime = aLastSegment.arrival 
        ? new Date(aLastSegment.arrival.at).getTime() 
        : new Date(`${a.arrival.date}T${a.arrival.time}`).getTime();
      const bArrivalTime = bLastSegment.arrival 
        ? new Date(bLastSegment.arrival.at).getTime() 
        : new Date(`${b.arrival.date}T${b.arrival.time}`).getTime();
      
      return aArrivalTime - bArrivalTime;
    }
    
    return 0;
  });
  
  // Helper function to get total duration from itinerary
  const getTotalDuration = (itinerary) => {
    return itinerary.duration || 
      itinerary.segments.reduce((total, segment) => {
        return total + durationToMinutes(segment.duration);
      }, 0);
  };
  
  // Helper function to convert duration string to minutes
  const durationToMinutes = (durationStr) => {
    if (!durationStr) return 0;
    
    // Handle ISO duration format (e.g., PT2H30M)
    if (durationStr.startsWith('PT')) {
      const hours = durationStr.match(/(\d+)H/);
      const minutes = durationStr.match(/(\d+)M/);
      
      return (hours ? parseInt(hours[1]) * 60 : 0) + 
             (minutes ? parseInt(minutes[1]) : 0);
    }
    
    // Handle formatted duration (e.g., "2h 30m")
    const parts = durationStr.split(' ');
    let totalMinutes = 0;
    
    for (const part of parts) {
      if (part.endsWith('h')) {
        totalMinutes += parseInt(part) * 60;
      } else if (part.endsWith('m')) {
        totalMinutes += parseInt(part);
      }
    }
    
    return totalMinutes;
  };
  
  // Toggle flight details
  const toggleFlightDetails = (id) => {
    setExpandedFlight(expandedFlight === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-medium">{sortedFlights.length} flights found</span>
            <span className="ml-2 text-sm text-gray-500">
              {origin} to {destination}
            </span>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="text-sm border border-gray-300 rounded p-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="price">Price</option>
              <option value="duration">Duration</option>
              <option value="departureTime">Departure time</option>
              <option value="arrivalTime">Arrival time</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {sortedFlights.map((flight) => (
          <FlightCard 
            key={flight.id || `${flight.airline}${flight.flightNumber}`}
            flight={flight}
            isExpanded={expandedFlight === (flight.id || `${flight.airline}${flight.flightNumber}`)}
            onToggleDetails={() => toggleFlightDetails(flight.id || `${flight.airline}${flight.flightNumber}`)}
            tripType={tripType}
          />
        ))}
      </div>
    </div>
  );
};

export default FlightsList;