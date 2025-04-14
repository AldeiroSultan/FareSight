// client/src/contexts/AlertContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AlertContext = createContext();

export const useAlerts = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    priceDropPercentage: 15,
    mistakeFareThreshold: 40
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all alerts for the user
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/alerts');
      
      setAlerts(response.data);
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching alerts');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch alert history
  const fetchAlertHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/alerts/history');
      
      setAlertHistory(response.data);
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching alert history');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch alert preferences
  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/alerts/preferences');
      
      setPreferences(response.data);
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching alert preferences');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new alert
  const createAlert = async (alertData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/alerts', alertData);
      
      // Refresh alerts after creating a new one
      fetchAlerts();
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating alert');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing alert
  const updateAlert = async (id, alertData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/alerts/${id}`, alertData);
      
      // Update the alert in the state
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === id ? { ...alert, ...alertData } : alert
        )
      );
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating alert');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete an alert
  const deleteAlert = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/alerts/${id}`);
      
      // Remove the alert from the state
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting alert');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update alert preferences
  const updatePreferences = async (preferencesData) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.put('/alerts/preferences', preferencesData);
      
      // Update the preferences in the state
      setPreferences(prev => ({ ...prev, ...preferencesData }));
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating preferences');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clear errors
  const clearError = () => setError(null);

  const value = {
    alerts,
    alertHistory,
    preferences,
    loading,
    error,
    fetchAlerts,
    fetchAlertHistory,
    fetchPreferences,
    createAlert,
    updateAlert,
    deleteAlert,
    updatePreferences,
    clearError
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};