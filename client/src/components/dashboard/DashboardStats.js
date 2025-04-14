// client/src/components/dashboard/DashboardStats.js
import React from 'react';
import { formatCurrency } from '../../utils/api';

const DashboardStats = ({ data }) => {
  // Calculate stats from dashboard data
  const calculateStats = () => {
    if (!data || !data.trackedRoutes || !data.recentAlerts) {
      return {
        activeAlerts: 0,
        averageSavings: 0,
        largestDrop: 0,
        potentialSavings: 0
      };
    }
    
    const activeAlerts = data.trackedRoutes.filter(route => route.alertEnabled).length;
    
    // Calculate average savings from recent alerts
    let totalSavings = 0;
    let largestDrop = 0;
    
    data.recentAlerts.forEach(alert => {
      const saving = alert.previousPrice - alert.price;
      totalSavings += saving;
      
      if (Math.abs(alert.percentageChange) > Math.abs(largestDrop)) {
        largestDrop = alert.percentageChange;
      }
    });
    
    const averageSavings = data.recentAlerts.length ? totalSavings / data.recentAlerts.length : 0;
    
    // Calculate potential savings from current tracked routes
    let potentialSavings = 0;
    data.trackedRoutes.forEach(route => {
      if (route.currentPrice && route.priceThreshold) {
        const potential = route.currentPrice > route.priceThreshold 
          ? route.currentPrice - route.priceThreshold
          : 0;
        potentialSavings += potential;
      }
    });
    
    return {
      activeAlerts,
      averageSavings,
      largestDrop,
      potentialSavings
    };
  };
  
  const stats = calculateStats();
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-full">
            <svg 
              className="h-6 w-6 text-blue-600" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Active Alerts</h3>
            <p className="text-lg font-semibold text-gray-800">{stats.activeAlerts}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex items-center">
          <div className="bg-green-100 p-3 rounded-full">
            <svg 
              className="h-6 w-6 text-green-600" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
              />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Avg. Savings</h3>
            <p className="text-lg font-semibold text-gray-800">{formatCurrency(stats.averageSavings)}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex items-center">
          <div className="bg-purple-100 p-3 rounded-full">
            <svg 
              className="h-6 w-6 text-purple-600" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" 
              />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Largest Drop</h3>
            <p className="text-lg font-semibold text-gray-800">
              {Math.abs(stats.largestDrop).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex items-center">
          <div className="bg-yellow-100 p-3 rounded-full">
            <svg 
              className="h-6 w-6 text-yellow-600" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Potential Savings</h3>
            <p className="text-lg font-semibold text-gray-800">{formatCurrency(stats.potentialSavings)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;