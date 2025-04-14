// client/src/pages/SearchResults.js
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import FlightSearchForm from '../components/search/FlightSearchForm';
import FlightsList from '../components/search/FlightsList';
import PriceAlert from '../components/search/PriceAlert';
import FlightFilters from '../components/search/FlightFilters';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [airports, setAirports] = useState([]);
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
  const [filters, setFilters] = useState({
    price: { min: 0, max: 2000 },
    airlines: [],
    stops: 'any',
    departureTime: 'any',
    returnTime: 'any'
  });
  
  // Extract search parameters
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departureDate = searchParams.get('departureDate');
  const returnDate = searchParams.get('returnDate');
  const passengers = searchParams.get('passengers') || 1;

  // Fetch flights and airports on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch airports for the search form
        const airportsResponse = await api.get('/flights/airports');
        setAirports(airportsResponse.data);
        
        // Fetch flights based on search params
        if (origin && destination && departureDate) {
          const flightsResponse = await api.get('/flights/search', {
            params: {
              origin,
              destination,
              departureDate,
              returnDate,
              adults: passengers
            }
          });
          
          if (flightsResponse.data && flightsResponse.data.length > 0) {
            setFlights(flightsResponse.data);
            setFilteredFlights(flightsResponse.data);
            
            // Set price range for filter
            const prices = flightsResponse.data.map(flight => flight.price.amount);
            if (prices.length > 0) {
              const min = Math.floor(Math.min(...prices));
              const max = Math.ceil(Math.max(...prices));
              setPriceRange({ min, max });
              setFilters(prev => ({
                ...prev,
                price: { min, max }
              }));
            }
            
          } else {
            setError('No flights found for the selected route and dates.');
          }
        } else {
          setError('Please provide origin, destination, and departure date to search for flights.');
        }
      } catch (err) {
        console.error('Error fetching flights:', err);
        setError('Failed to fetch flights. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [origin, destination, departureDate, returnDate, passengers]);
  
  // Apply filters to flights
  useEffect(() => {
    if (flights.length === 0) return;
    
    const filtered = flights.filter(flight => {
      // Filter by price
      const flightPrice = flight.price.amount;
      if (flightPrice < filters.price.min || flightPrice > filters.price.max) {
        return false;
      }
      
      // Filter by airlines
      if (filters.airlines.length > 0) {
        const flightAirlines = Array.isArray(flight.validatingAirlineCodes) 
          ? flight.validatingAirlineCodes 
          : [flight.airline];
        
        if (!filters.airlines.some(airline => flightAirlines.includes(airline))) {
          return false;
        }
      }
      
      // Filter by stops
      if (filters.stops !== 'any') {
        const flightStops = flight.itineraries 
          ? flight.itineraries[0].segments.length - 1 
          : flight.stops || 0;
          
        if (filters.stops === 'nonstop' && flightStops !== 0) {
          return false;
        } else if (filters.stops === '1stop' && flightStops !== 1) {
          return false;
        } else if (filters.stops === '2plusStops' && flightStops < 2) {
          return false;
        }
      }
      
      // Filter by departure time
      if (filters.departureTime !== 'any' && flight.itineraries) {
        const departureDateTimeStr = flight.itineraries[0].segments[0].departure.at;
        const departureHour = new Date(departureDateTimeStr).getHours();
        
        if (filters.departureTime === 'morning' && (departureHour < 5 || departureHour >= 12)) {
          return false;
        } else if (filters.departureTime === 'afternoon' && (departureHour < 12 || departureHour >= 18)) {
          return false;
        } else if (filters.departureTime === 'evening' && (departureHour < 18 || departureHour >= 22)) {
          return false;
        } else if (filters.departureTime === 'night' && (departureHour >= 5 && departureHour < 22)) {
          return false;
        }
      }
      
      // Return true if all filters pass
      return true;
    });
    
    setFilteredFlights(filtered);
  }, [flights, filters]);
  
  // Toggle search form
  const toggleSearchForm = () => {
    setShowSearchForm(prev => !prev);
  };
  
  // Handle filters change
  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };
  
  // Get available airlines from flights
  const getAvailableAirlines = () => {
    if (flights.length === 0) return [];
    
    const airlinesSet = new Set();
    
    flights.forEach(flight => {
      if (flight.validatingAirlineCodes) {
        flight.validatingAirlineCodes.forEach(airline => {
          airlinesSet.add(airline);
        });
      } else if (flight.airline) {
        airlinesSet.add(flight.airline);
      }
    });
    
    return Array.from(airlinesSet);
  };
  
  const availableAirlines = getAvailableAirlines();
  
  // Get origin and destination names
  const getAirportName = (code) => {
    const airport = airports.find(a => a.code === code);
    return airport ? airport.name : code;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Flight Search Results</h1>
        <div className="flex items-center text-gray-600">
          <p>
            {getAirportName(origin)} to {getAirportName(destination)} • {new Date(departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {returnDate && ` to ${new Date(returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`} • {passengers} passenger{passengers > 1 ? 's' : ''}
          </p>
          <button 
            onClick={toggleSearchForm}
            className="ml-3 text-blue-600 text-sm hover:text-blue-800"
          >
            Edit Search
          </button>
        </div>
      </div>
      
      {showSearchForm && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <FlightSearchForm 
            onSubmit={() => {}} 
            airports={airports}
            initialValues={{
              origin,
              destination,
              departureDate,
              returnDate,
              passengers: Number(passengers),
              tripType: returnDate ? 'roundTrip' : 'oneWay'
            }}
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FlightFilters 
            filters={filters}
            priceRange={priceRange}
            airlines={availableAirlines}
            onChange={handleFiltersChange}
          />
          
          <div className="bg-white shadow-md rounded-lg p-6 mt-6">
            <PriceAlert 
              origin={origin}
              destination={destination}
              departureDate={departureDate}
              returnDate={returnDate}
              lowestPrice={filteredFlights.length > 0 ? Math.min(...filteredFlights.map(f => f.price.amount)) : 0}
            />
          </div>
        </div>
        
        <div className="lg:col-span-3">
          {loading ? (
            <div className="bg-white shadow-md rounded-lg p-6 flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <p>{error}</p>
                <Link 
                  to="/search" 
                  className="mt-2 text-sm text-red-600 underline"
                >
                  Try a different search
                </Link>
              </div>
            </div>
          ) : filteredFlights.length === 0 ? (
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
                <p>No flights match your current filters. Try adjusting your filters to see more results.</p>
                <button 
                  onClick={() => setFilters({
                    price: priceRange,
                    airlines: [],
                    stops: 'any',
                    departureTime: 'any',
                    returnTime: 'any'
                  })}
                  className="mt-2 text-sm text-yellow-600 underline"
                >
                  Reset filters
                </button>
              </div>
            </div>
          ) : (
            <FlightsList 
              flights={filteredFlights} 
              tripType={returnDate ? 'roundTrip' : 'oneWay'}
              origin={origin}
              destination={destination}
              departureDate={departureDate}
              returnDate={returnDate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;