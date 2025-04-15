// client/src/components/layout/NewHeader.js
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NewHeader = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <header className="header">
      <div className="container">
        <div className="navbar">
          <div className="logo">
            <i className="fas fa-paper-plane"></i>
            <span>FareSight</span>
          </div>
          <nav className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <ul>
              <li>
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/search" className={({ isActive }) => isActive ? 'active' : ''}>
                  Search Flights
                </NavLink>
              </li>
              <li>
                <NavLink to="/alerts" className={({ isActive }) => isActive ? 'active' : ''}>
                  My Alerts
                </NavLink>
              </li>
              <li>
                <NavLink to="/price-history" className={({ isActive }) => isActive ? 'active' : ''}>
                  Price History
                </NavLink>
              </li>
            </ul>
          </nav>
          <div className="nav-right">
            <button className="notifications">
              <i className="fas fa-bell"></i>
              <span className="badge">3</span>
            </button>
            <div className={`user-profile ${dropdownOpen ? 'active' : ''}`} onClick={() => setDropdownOpen(!dropdownOpen)}>
              <img src="https://via.placeholder.com/40" alt="User profile" />
              <div className="dropdown">
                <div className="dropdown-menu">
                  <Link to="/account">
                    <i className="fas fa-user"></i> Profile
                  </Link>
                  <Link to="/account">
                    <i className="fas fa-cog"></i> Settings
                  </Link>
                  <a href="#" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </a>
                </div>
              </div>
            </div>
          </div>
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default NewHeader;