// client/src/components/layout/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Flight Price Tracker</h3>
            <p className="text-gray-300 mb-4">
              Track flight prices across multiple destinations and get alerts when prices drop or mistake fares appear.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-300 hover:text-white">
                  Search Flights
                </Link>
              </li>
              <li>
                <Link to="/alerts" className="text-gray-300 hover:text-white">
                  My Alerts
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-gray-300 hover:text-white">
                  Account Settings
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <p className="text-gray-300 mb-2">
              Have questions or suggestions?
            </p>
            <a 
              href="mailto:support@flightpricetracker.com" 
              className="text-blue-400 hover:text-blue-300"
            >
              support@flightpricetracker.com
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">
            &copy; {year} Flight Price Tracker. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="sr-only">Privacy Policy</span>
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="sr-only">Terms of Service</span>
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;