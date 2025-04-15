// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';

// Style imports
import './styles/dark-theme.css';

// Layout components
import NewHeader from './components/layout/NewHeader';
import NewFooter from './components/layout/NewFooter';

// Page components
import NewDashboard from './pages/NewDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import SearchResults from './pages/SearchResults';
import PriceHistory from './pages/PriceHistory';
import Alerts from './pages/Alerts';
import Account from './pages/Account';
import NotFound from './pages/NotFound';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-container">
      <div className="loading-spinner"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AlertProvider>
          <div className="app-container">
            <NewHeader />
            <main>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <NewDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <NewDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/search" 
                  element={
                    <ProtectedRoute>
                      <Search />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/search/results" 
                  element={
                    <ProtectedRoute>
                      <SearchResults />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/price-history" 
                  element={
                    <ProtectedRoute>
                      <PriceHistory />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/alerts" 
                  element={
                    <ProtectedRoute>
                      <Alerts />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/account" 
                  element={
                    <ProtectedRoute>
                      <Account />
                    </ProtectedRoute>
                  } 
                />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <NewFooter />
          </div>
        </AlertProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;