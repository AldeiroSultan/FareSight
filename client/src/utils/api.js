// client/src/utils/api.js
import axios from 'axios';

// Create an instance of axios with custom config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for cookies/sessions
});

// Add a request interceptor
api.interceptors.request.use(
  config => {
    // You can add common request handling here
    return config;
  },
  error => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  response => {
    // Any status code within the range of 2xx
    return response;
  },
  error => {
    // Handle session expiry
    if (error.response && error.response.status === 401) {
      // Clear local auth state if needed
      // window.location.href = '/login';
    }
    
    // Return the error for handling in components
    return Promise.reject(error);
  }
);

export default api;

// Helper functions for common API calls

// Format date for API requests
export const formatDate = (date) => {
  if (!date) return null;
  
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return date.toISOString().split('T')[0];
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

// Format flight duration
export const formatDuration = (durationStr) => {
  if (!durationStr) return '';
  
  // Handle ISO duration format like PT2H30M
  if (durationStr.startsWith('PT')) {
    const hours = durationStr.match(/(\d+)H/);
    const minutes = durationStr.match(/(\d+)M/);
    
    return `${hours ? hours[1] + 'h ' : ''}${minutes ? minutes[1] + 'm' : ''}`.trim();
  }
  
  // Handle already formatted duration like "2h 30m"
  return durationStr;
};

// Format date and time for display
export const formatDateTime = (dateTimeStr, includeYear = false) => {
  if (!dateTimeStr) return '';
  
  const date = new Date(dateTimeStr);
  const options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  };
  
  if (includeYear) {
    options.year = 'numeric';
  }
  
  return date.toLocaleString('en-US', options);
};

// Format date only
export const formatDateOnly = (dateStr) => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};