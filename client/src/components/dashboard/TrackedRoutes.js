// client/src/components/dashboard/TrackedRoutes.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency, formatDateOnly } from '../../utils/api';
import { useAlerts } from '../../contexts/AlertContext';

const TrackedRoutes = ({ routes }) => {
  const navigate = useNavigate();
  const { updateAlert, deleteAlert } = useAlerts();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingAlert, setEditingAlert] = useState(null);
  const [priceThreshold, setPriceThreshold] = useState('');
  const [loading, setLoading] = useState({
    delete: null,
    update: null,
    toggle: null
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!routes || routes.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Tracked Routes</h2>
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-gray-500 text-center">No routes being tracked.</p>
          <div className="mt-3 text-center">
            <Link 
              to="/search" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add a Route
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle delete confirmation
  const handleConfirmDelete = (id) => {
    setConfirmDelete(id);
  };

  // Handle alert deletion
  const handleDeleteAlert = async (id) => {
    try {
      setLoading(prev => ({ ...prev, delete: id }));
      setError(null);
      setSuccess(null);
      
      const success = await deleteAlert(id);
      
      if (success) {
        setSuccess(`Alert successfully deleted`);
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError('Failed to delete alert');
      }
    } catch (err) {
      console.error('Error deleting alert:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(prev => ({ ...prev, delete: null }));
      setConfirmDelete(null);
    }
  };

  // Handle editing alert
  const handleEditClick = (route) => {
    setEditingAlert(route.id);
    setPriceThreshold(route.priceThreshold.toString());
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingAlert(null);
    setPriceThreshold('');
  };

  // Handle saving edited alert
  const handleSaveEdit = async (id) => {
    try {
      setLoading(prev => ({ ...prev, update: id }));
      setError(null);
      setSuccess(null);
      
      const updatedThreshold = parseFloat(priceThreshold);
      
      if (isNaN(updatedThreshold) || updatedThreshold <= 0) {
        setError('Please enter a valid price threshold');
        return;
      }
      
      const success = await updateAlert(id, { priceThreshold: updatedThreshold });
      
      if (success) {
        setSuccess(`Alert threshold updated to ${formatCurrency(updatedThreshold)}`);
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
        setEditingAlert(null);
      } else {
        setError('Failed to update alert');
      }
    } catch (err) {
      console.error('Error updating alert:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(prev => ({ ...prev, update: null }));
    }
  };

  // Handle toggling alert status
  const handleToggleAlert = async (id, currentStatus) => {
    try {
      setLoading(prev => ({ ...prev, toggle: id }));
      setError(null);
      setSuccess(null);
      
      const success = await updateAlert(id, { alertEnabled: !currentStatus });
      
      if (success) {
        setSuccess(`Alert ${currentStatus ? 'disabled' : 'enabled'} successfully`);
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError('Failed to update alert status');
      }
    } catch (err) {
      console.error('Error toggling alert:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(prev => ({ ...prev, toggle: null }));
    }
  };

  // Handle search click
  const handleSearchClick = (route) => {
    const searchParams = new URLSearchParams();
    searchParams.append('origin', route.origin.code);
    searchParams.append('destination', route.destination.code);
    searchParams.append('departureDate', route.departureDate);
    
    if (route.returnDate) {
      searchParams.append('returnDate', route.returnDate);
    }
    
    navigate({
      pathname: '/search/results',
      search: searchParams.toString()
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tracked Routes</h2>
        <Link 
          to="/alerts" 
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View All →
        </Link>
      </div>
      
      {/* Error and Success Messages */}
      {error && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
          {success}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Route
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Dates
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Current Price
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Alert Threshold
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {routes.map(route => (
              <tr key={route.id}>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-0">
                      <div className="text-sm font-medium text-gray-900">
                        {route.origin.code} → {route.destination.code}
                      </div>
                      <div className="text-xs text-gray-500">
                        {route.origin.name} to {route.destination.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDateOnly(route.departureDate)}</div>
                  {route.returnDate && (
                    <div className="text-xs text-gray-500">
                      to {formatDateOnly(route.returnDate)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {route.currentPrice ? (
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(route.currentPrice)}
                      </span>
                      
                      {route.percentageChange && (
                        <span 
                          className={`ml-2 text-xs ${
                            route.percentageChange < 0 
                              ? 'text-green-600' 
                              : route.percentageChange > 0 
                                ? 'text-red-600' 
                                : 'text-gray-500'
                          }`}
                        >
                          {route.percentageChange > 0 ? '+' : ''}
                          {route.percentageChange.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Not available</span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {editingAlert === route.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={priceThreshold}
                        onChange={(e) => setPriceThreshold(e.target.value)}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="1"
                      />
                      <button
                        onClick={() => handleSaveEdit(route.id)}
                        disabled={loading.update === route.id}
                        className="text-green-600 hover:text-green-800"
                      >
                        {loading.update === route.id ? (
                          <svg 
                            className="animate-spin h-4 w-4" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24"
                          >
                            <circle 
                              className="opacity-25" 
                              cx="12" 
                              cy="12" 
                              r="10" 
                              stroke="currentColor" 
                              strokeWidth="4"
                            ></circle>
                            <path 
                              className="opacity-75" 
                              fill="currentColor" 
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <svg 
                            className="h-4 w-4" 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg 
                          className="h-4 w-4" 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-900">
                      {formatCurrency(route.priceThreshold)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {route.status === 'below-threshold' ? (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Below Threshold
                    </span>
                  ) : route.status === 'above-threshold' ? (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Above Threshold
                    </span>
                  ) : (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      Unknown
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {/* Toggle Alert Button */}
                    <button
                      onClick={() => handleToggleAlert(route.id, route.alertEnabled)}
                      disabled={loading.toggle === route.id}
                      className={`${
                        route.alertEnabled 
                          ? 'text-green-600 hover:text-green-800' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={route.alertEnabled ? 'Disable alert' : 'Enable alert'}
                    >
                      {loading.toggle === route.id ? (
                        <svg 
                          className="animate-spin h-5 w-5" 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24"
                        >
                          <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                          ></circle>
                          <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <svg 
                          className="h-5 w-5" 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path 
                            d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" 
                          />
                        </svg>
                      )}
                    </button>
                    
                    {/* Edit Button */}
                    {editingAlert !== route.id && (
                      <button
                        onClick={() => handleEditClick(route)}
                        className="text-indigo-600 hover:text-indigo-800"
                        title="Edit alert threshold"
                      >
                        <svg 
                          className="h-5 w-5" 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path 
                            d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" 
                          />
                        </svg>
                      </button>
                    )}
                    
                    {/* Delete Button */}
                    {confirmDelete !== route.id ? (
                      <button
                        onClick={() => handleConfirmDelete(route.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete alert"
                      >
                        <svg 
                          className="h-5 w-5" 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </button>
                    ) : (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleDeleteAlert(route.id)}
                          disabled={loading.delete === route.id}
                          className="text-red-600 hover:text-red-800"
                          title="Confirm delete"
                        >
                          {loading.delete === route.id ? (
                            <svg 
                              className="animate-spin h-5 w-5" 
                              xmlns="http://www.w3.org/2000/svg" 
                              fill="none" 
                              viewBox="0 0 24 24"
                            >
                              <circle 
                                className="opacity-25" 
                                cx="12" 
                                cy="12" 
                                r="10" 
                                stroke="currentColor" 
                                strokeWidth="4"
                              ></circle>
                              <path 
                                className="opacity-75" 
                                fill="currentColor" 
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          ) : (
                            <svg 
                              className="h-5 w-5" 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 20 20" 
                              fill="currentColor"
                            >
                              <path 
                                fillRule="evenodd" 
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                clipRule="evenodd" 
                              />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-gray-600 hover:text-gray-800"
                          title="Cancel delete"
                        >
                          <svg 
                            className="h-5 w-5" 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    {/* Search Button */}
                    <button
                      onClick={() => handleSearchClick(route)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Search for flights"
                    >
                      <svg 
                        className="h-5 w-5" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </button>
                    
                    {/* Price History Button */}
                    <Link 
                      to={`/price-history?origin=${route.origin.code}&destination=${route.destination.code}&departureDate=${route.departureDate}${route.returnDate ? `&returnDate=${route.returnDate}` : ''}`}
                      className="text-blue-600 hover:text-blue-800"
                      title="View price history"
                    >
                      <svg 
                        className="h-5 w-5" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M3 3a1 1 0 000 2h14a1 1 0 100-2H3zm0 6a1 1 0 000 2h9a1 1 0 100-2H3zm0 6a1 1 0 100 2h5a1 1 0 100-2H3z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex justify-center">
        <Link 
          to="/search" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
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
          Add New Route
        </Link>
      </div>
    </div>
  );
};

export default TrackedRoutes;