// client/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { formatCurrency, formatDateOnly } from '../utils/api';
import DashboardStats from '../components/dashboard/DashboardStats';
import TrackedRoutes from '../components/dashboard/TrackedRoutes';
import PriceChart from '../components/dashboard/PriceChart';
import RecentAlerts from '../components/dashboard/RecentAlerts';
import FlightDeals from '../components/dashboard/FlightDeals';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/users/dashboard');
        setDashboardData(response.data);
        
        // Also fetch flight deals if user has tracking set up
        if (response.data.trackedRoutes.length > 0) {
          const firstRoute = response.data.trackedRoutes[0];
          const dealsResponse = await api.get(`/flights/deals?origin=${firstRoute.origin.code}`);
          setDeals(dealsResponse.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-sm text-red-600 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.firstName || 'Traveler'}!</h1>
        <p className="text-gray-600">Track your flight prices and discover great deals.</p>
      </div>

      {!dashboardData?.trackedRoutes.length ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Get Started</h2>
          <p className="mb-4">You don't have any flight routes being tracked yet.</p>
          <Link 
            to="/search" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg 
              className="h-5 w-5 mr-2" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
              />
            </svg>
            Search for Flights
          </Link>
        </div>
      ) : (
        <>
          <DashboardStats data={dashboardData} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <PriceChart priceTrends={dashboardData.priceTrends} />
            </div>
            <div>
              <RecentAlerts alerts={dashboardData.recentAlerts} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TrackedRoutes routes={dashboardData.trackedRoutes} />
            </div>
            <div>
              <FlightDeals deals={deals} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;