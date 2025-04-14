// client/src/components/dashboard/RecentAlerts.js
import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/api';

const RecentAlerts = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 h-full">
        <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
        <div className="p-4 bg-gray-50 rounded-md h-full flex items-center justify-center">
          <p className="text-gray-500 text-center">No alerts yet. We'll notify you when prices drop!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Alerts</h2>
        <Link 
          to="/alerts" 
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View All →
        </Link>
      </div>
      
      <div className="space-y-4">
        {alerts.map(alert => (
          <div 
            key={alert.id} 
            className={`border-l-4 ${
              alert.alertType === 'MISTAKE_FARE' 
                ? 'border-red-500 bg-red-50' 
                : 'border-green-500 bg-green-50'
            } p-4 rounded-r-md`}
          >
            <div className="flex justify-between">
              <div className="font-medium">
                {alert.route}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(alert.sentAt).toLocaleDateString()}
              </div>
            </div>
            
            <div className="mt-1 flex items-center">
              <span className="text-lg font-semibold">
                {formatCurrency(alert.price)}
              </span>
              <span className="ml-2 text-sm text-green-600">
                -{Math.abs(alert.percentageChange).toFixed(1)}%
              </span>
            </div>
            
            <div className="mt-1 text-sm">
              <span className="line-through text-gray-500">
                {formatCurrency(alert.previousPrice)}
              </span>
              {' '}→{' '}
              <span className="font-medium">
                {formatCurrency(alert.price)}
              </span>
            </div>
            
            {alert.alertType === 'MISTAKE_FARE' && (
              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  Mistake Fare
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAlerts;