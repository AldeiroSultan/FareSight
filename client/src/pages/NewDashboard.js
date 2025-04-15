import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const NewDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchForm, setSearchForm] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: ''
  });
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/users/dashboard');
        setDashboardData(response.data);
        
        if (response.data.priceTrends && response.data.priceTrends.length > 0) {
          setSelectedRoute(response.data.priceTrends[0].route);
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

  // Handle search form changes
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!searchForm.origin || !searchForm.destination || !searchForm.departureDate) {
      alert('Please fill in required fields');
      return;
    }
    
    // Navigate to search results
    window.location.href = `/search/results?origin=${searchForm.origin}&destination=${searchForm.destination}&departureDate=${searchForm.departureDate}${searchForm.returnDate ? `&returnDate=${searchForm.returnDate}` : ''}`;
  };

  // Handle route change for chart
  const handleRouteChange = (e) => {
    setSelectedRoute(e.target.value);
  };

  // Get chart data for selected route
  const getChartData = () => {
    if (!dashboardData || !dashboardData.priceTrends) {
      return {
        labels: [],
        datasets: [{
          label: 'Price (USD)',
          data: [],
          fill: true,
          backgroundColor: 'rgba(75, 192, 255, 0.2)',
          borderColor: 'rgba(75, 192, 255, 1)',
          tension: 0.4,
          pointBackgroundColor: 'rgba(75, 192, 255, 1)',
          pointBorderColor: '#fff',
          pointRadius: 4
        }]
      };
    }

    // Find the selected trend data
    const selectedTrend = dashboardData.priceTrends.find(trend => trend.route === selectedRoute) || dashboardData.priceTrends[0];
    
    if (!selectedTrend) {
      return {
        labels: [],
        datasets: [{
          label: 'Price (USD)',
          data: [],
          fill: true,
          backgroundColor: 'rgba(75, 192, 255, 0.2)',
          borderColor: 'rgba(75, 192, 255, 1)',
          tension: 0.4,
          pointBackgroundColor: 'rgba(75, 192, 255, 1)',
          pointBorderColor: '#fff',
          pointRadius: 4
        }]
      };
    }

    // Format the data for the chart
    return {
      labels: selectedTrend.data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: 'Price (USD)',
        data: selectedTrend.data.map(d => d.price),
        fill: true,
        backgroundColor: 'rgba(75, 192, 255, 0.2)',
        borderColor: 'rgba(75, 192, 255, 1)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(75, 192, 255, 1)',
        pointBorderColor: '#fff',
        pointRadius: 4
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(30, 30, 45, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(75, 192, 255, 0.3)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function(context) {
            return `$${context.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  };

  // Helper functions
  function calculateAverageSavings() {
    if (!dashboardData?.recentAlerts || dashboardData.recentAlerts.length === 0) return 0;
    
    const totalSavings = dashboardData.recentAlerts.reduce((sum, alert) => {
      return sum + (alert.previousPrice - alert.price);
    }, 0);
    
    return Math.round(totalSavings / dashboardData.recentAlerts.length);
  }
  
  function calculateLargestDrop() {
    if (!dashboardData?.recentAlerts || dashboardData.recentAlerts.length === 0) return 0;
    
    let largestDrop = 0;
    dashboardData.recentAlerts.forEach(alert => {
      const drop = Math.abs(alert.percentageChange);
      if (drop > largestDrop) largestDrop = drop;
    });
    
    return Math.round(largestDrop);
  }
  
  function getNextTripDate() {
    if (!dashboardData?.trackedRoutes || dashboardData.trackedRoutes.length === 0) return 'None';
    
    // Find the closest upcoming departure date
    const today = new Date();
    let closestDate = null;
    let closestDiff = Infinity;
    
    dashboardData.trackedRoutes.forEach(route => {
      const departureDate = new Date(route.departureDate);
      if (departureDate >= today) {
        const diff = departureDate - today;
        if (diff < closestDiff) {
          closestDiff = diff;
          closestDate = departureDate;
        }
      }
    });
    
    if (!closestDate) return 'None';
    
    return closestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  function handleSearchClick(route) {
    // Navigate to search results with these parameters
    window.location.href = `/search/results?origin=${route.origin.code}&destination=${route.destination.code}&departureDate=${route.departureDate}${route.returnDate ? `&returnDate=${route.returnDate}` : ''}`;
  }
  
  function handleEditClick(route) {
    // Navigate to edit alert page or open a modal
    console.log('Edit alert for route:', route);
    // Implementation depends on your app's structure
    window.location.href = `/alerts?edit=${route.id}`;
  }
  
  function handleDeleteClick(id) {
    // Delete the alert with confirmation
    if (window.confirm('Are you sure you want to delete this alert?')) {
      api.delete(`/alerts/${id}`)
        .then(() => {
          // Refresh data after deletion
          window.location.reload();
        })
        .catch(err => {
          console.error('Error deleting alert:', err);
          alert('Failed to delete alert. Please try again.');
        });
    }
  }
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }
  
  return (
    <>
      {/* Hero section with search */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Find the Best Flight Deals</h1>
            <p>Track prices and get alerted when fares drop</p>
          </div>
          <div className="search-box">
            <form onSubmit={handleSearchSubmit}>
              <div className="search-row">
                <div className="search-group">
                  <label>From</label>
                  <div className="input-with-icon">
                    <i className="fas fa-plane-departure"></i>
                    <input 
                      type="text" 
                      name="origin"
                      value={searchForm.origin}
                      onChange={handleSearchChange}
                      placeholder="City or airport" 
                    />
                  </div>
                </div>
                <div className="search-group">
                  <label>To</label>
                  <div className="input-with-icon">
                    <i className="fas fa-plane-arrival"></i>
                    <input 
                      type="text" 
                      name="destination"
                      value={searchForm.destination}
                      onChange={handleSearchChange}
                      placeholder="City or airport" 
                    />
                  </div>
                </div>
                <div className="search-group">
                  <label>Depart</label>
                  <div className="input-with-icon">
                    <i className="fas fa-calendar"></i>
                    <input 
                      type="date" 
                      name="departureDate"
                      value={searchForm.departureDate}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
                <div className="search-group">
                  <label>Return</label>
                  <div className="input-with-icon">
                    <i className="fas fa-calendar-plus"></i>
                    <input 
                      type="date" 
                      name="returnDate"
                      value={searchForm.returnDate}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
                <button type="submit" className="search-button">
                  <i className="fas fa-search"></i>
                  <span>Search</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
  
      {/* Main content */}
      <main className="main">
        <div className="container">
          {/* Stats cards */}
          <div className="stats-section">
            <div className="stats-card">
              <div className="stats-icon">
                <i className="fas fa-bell"></i>
              </div>
              <div className="stats-content">
                <h3>{dashboardData?.trackedRoutes?.filter(r => r.alertEnabled).length || 0}</h3>
                <p>Active Alerts</p>
              </div>
            </div>
            <div className="stats-card">
              <div className="stats-icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="stats-content">
                <h3>${calculateAverageSavings()}</h3>
                <p>Avg. Savings</p>
              </div>
            </div>
            <div className="stats-card">
              <div className="stats-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="stats-content">
                <h3>{calculateLargestDrop()}%</h3>
                <p>Largest Drop</p>
              </div>
            </div>
            <div className="stats-card">
              <div className="stats-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="stats-content">
                <h3>{getNextTripDate()}</h3>
                <p>Next Trip</p>
              </div>
            </div>
          </div>
  
          {/* Two column layout */}
          <div className="dashboard-grid">
            {/* Price history */}
            <div className="dashboard-card price-history">
              <div className="card-header">
                <h2>Price History</h2>
                <select 
                  className="route-select" 
                  value={selectedRoute || ''}
                  onChange={handleRouteChange}
                >
                  {dashboardData?.priceTrends?.map((trend, index) => (
                    <option key={index} value={trend.route}>{trend.route}</option>
                  ))}
                </select>
              </div>
              <div className="chart-container">
                <Line data={getChartData()} options={chartOptions} />
              </div>
            </div>
  
            {/* Recent alerts */}
            <div className="dashboard-card recent-alerts">
              <div className="card-header">
                <h2>Recent Alerts</h2>
                <Link to="/alerts" className="view-all">View all</Link>
              </div>
              <div className="alerts-list">
                {dashboardData?.recentAlerts && dashboardData.recentAlerts.length > 0 ? (
                  dashboardData.recentAlerts.map(alert => (
                    <div className="alert-item" key={alert.id}>
                      <div className="alert-top">
                        <span className="alert-route">{alert.route}</span>
                        <span className="alert-date">{new Date(alert.sentAt).toLocaleDateString()}</span>
                      </div>
                      <div className="alert-price">
                        <span className="new-price">${alert.price}</span>
                        <span className="price-change">-{Math.abs(alert.percentageChange).toFixed(1)}%</span>
                      </div>
                      <div className="alert-old-price">
                        <span className="old">${alert.previousPrice}</span>
                        <span className="arrow">→</span>
                        <span className="new">${alert.price}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6" style={{color: 'var(--text-muted)'}}>
                    No recent alerts. We'll notify you when prices drop!
                  </div>
                )}
              </div>
            </div>
          </div>
  
          {/* Tracked routes table */}
          <div className="dashboard-card tracked-routes">
            <div className="card-header">
              <h2>Tracked Routes</h2>
              <Link to="/alerts" className="view-all">View all</Link>
            </div>
            <div className="table-container">
              {dashboardData?.trackedRoutes && dashboardData.trackedRoutes.length > 0 ? (
                <table className="routes-table">
                  <thead>
                    <tr>
                      <th>Route</th>
                      <th>Date</th>
                      <th>Current Price</th>
                      <th>Alert Threshold</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.trackedRoutes.map(route => (
                      <tr key={route.id}>
                        <td>{route.origin.code} → {route.destination.code}</td>
                        <td>{new Date(route.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td>${route.currentPrice || 'N/A'}</td>
                        <td>${route.priceThreshold}</td>
                        <td>
                          <span className={`status-badge ${route.status === 'below-threshold' ? 'below' : 'above'}`}>
                            {route.status === 'below-threshold' ? 'Below Threshold' : 'Above Threshold'}
                          </span>
                        </td>
                        <td className="actions">
                          <button className="action-btn search-btn" title="Search flights" onClick={() => handleSearchClick(route)}>
                            <i className="fas fa-search"></i>
                          </button>
                          <button className="action-btn alert-btn" title="Edit alert" onClick={() => handleEditClick(route)}>
                            <i className="fas fa-bell"></i>
                          </button>
                          <button className="action-btn delete-btn" title="Delete alert" onClick={() => handleDeleteClick(route.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-6" style={{color: 'var(--text-muted)'}}>
                  No routes being tracked. Add a route to start monitoring prices.
                </div>
              )}
            </div>
            <div className="add-route">
              <Link to="/search" className="add-route-btn">
                <i className="fas fa-plus"></i> Add New Route
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
  };
  
  export default NewDashboard;