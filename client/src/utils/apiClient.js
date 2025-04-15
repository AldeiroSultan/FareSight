// client/src/utils/apiClient.js
import api from './api';

/**
 * API client for flight-related operations
 */
const FlightAPI = {
  /**
   * Search for flights
   * @param {string} origin - Origin airport code
   * @param {string} destination - Destination airport code
   * @param {string} departureDate - Departure date in YYYY-MM-DD format
   * @param {string} returnDate - Return date in YYYY-MM-DD format (optional)
   * @param {number} passengers - Number of passengers
   * @returns {Promise} - Flight search results
   */
  searchFlights: async (origin, destination, departureDate, returnDate = null, passengers = 1) => {
    try {
      const params = { origin, destination, departureDate, passengers };
      
      if (returnDate) {
        params.returnDate = returnDate;
      }
      
      const response = await api.get('/flights/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching flights:', error);
      throw error;
    }
  },
  
  /**
   * Get flight deals from an origin
   * @param {string} origin - Origin airport code
   * @returns {Promise} - Flight deals
   */
  getFlightDeals: async (origin) => {
    try {
      const response = await api.get('/flights/deals', { params: { origin } });
      return response.data;
    } catch (error) {
      console.error('Error fetching flight deals:', error);
      throw error;
    }
  },
  
  /**
   * Get price history for a route
   * @param {string} origin - Origin airport code
   * @param {string} destination - Destination airport code
   * @param {string} departureDate - Departure date (optional)
   * @param {string} returnDate - Return date (optional)
   * @returns {Promise} - Price history data
   */
  getPriceHistory: async (origin, destination, departureDate = null, returnDate = null) => {
    try {
      const params = { origin, destination };
      
      if (departureDate) {
        params.departureDate = departureDate;
      }
      
      if (returnDate) {
        params.returnDate = returnDate;
      }
      
      const response = await api.get('/flights/price-history', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching price history:', error);
      throw error;
    }
  },
};

/**
 * API client for alert-related operations
 */
const AlertAPI = {
  /**
   * Get all alerts for the current user
   * @returns {Promise} - User's alerts
   */
  getAlerts: async () => {
    try {
      const response = await api.get('/alerts');
      return response.data;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  },
  
  /**
   * Create a new price alert
   * @param {Object} alertData - Alert data
   * @returns {Promise} - Created alert
   */
  createAlert: async (alertData) => {
    try {
      const response = await api.post('/alerts', alertData);
      return response.data;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing alert
   * @param {string} id - Alert ID
   * @param {Object} updateData - Data to update
   * @returns {Promise} - Update result
   */
  updateAlert: async (id, updateData) => {
    try {
      const response = await api.put(`/alerts/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating alert:', error);
      throw error;
    }
  },
  
  /**
   * Delete an alert
   * @param {string} id - Alert ID
   * @returns {Promise} - Delete result
   */
  deleteAlert: async (id) => {
    try {
      const response = await api.delete(`/alerts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  },
  
  /**
   * Get alert history
   * @returns {Promise} - Alert history
   */
  getAlertHistory: async () => {
    try {
      const response = await api.get('/alerts/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching alert history:', error);
      throw error;
    }
  },
  
  /**
   * Get alert preferences
   * @returns {Promise} - Alert preferences
   */
  getPreferences: async () => {
    try {
      const response = await api.get('/alerts/preferences');
      return response.data;
    } catch (error) {
      console.error('Error fetching alert preferences:', error);
      throw error;
    }
  },
  
  /**
   * Update alert preferences
   * @param {Object} preferencesData - Preferences to update
   * @returns {Promise} - Update result
   */
  updatePreferences: async (preferencesData) => {
    try {
      const response = await api.put('/alerts/preferences', preferencesData);
      return response.data;
    } catch (error) {
      console.error('Error updating alert preferences:', error);
      throw error;
    }
  }
};

/**
 * API client for user-related operations
 */
const UserAPI = {
  /**
   * Get current user's profile
   * @returns {Promise} - User profile
   */
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
  
  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} - Update result
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  /**
   * Update user password
   * @param {Object} passwordData - Password data with currentPassword and newPassword
   * @returns {Promise} - Update result
   */
  updatePassword: async (passwordData) => {
    try {
      const response = await api.put('/users/password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },
  
  /**
   * Get dashboard data
   * @returns {Promise} - Dashboard data
   */
  getDashboardData: async () => {
    try {
      const response = await api.get('/users/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
};

/**
 * API client for authentication
 */
const AuthAPI = {
  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Login result
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - Registration result
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  /**
   * Logout current user
   * @returns {Promise} - Logout result
   */
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  /**
   * Get current user
   * @returns {Promise} - Current user data
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }
};

// Export all API clients
export { FlightAPI, AlertAPI, UserAPI, AuthAPI };