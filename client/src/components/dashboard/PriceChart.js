// client/src/components/dashboard/PriceChart.js
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/api';

const PriceChart = ({ priceTrends }) => {
  const [selectedRoute, setSelectedRoute] = useState(
    priceTrends && priceTrends.length > 0 ? priceTrends[0].route : null
  );
  
  if (!priceTrends || priceTrends.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Price Trends</h2>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">No price history available yet.</p>
        </div>
      </div>
    );
  }
  
  const selectedTrend = priceTrends.find(trend => trend.route === selectedRoute) || priceTrends[0];
  
  // Format data for the chart
  const chartData = selectedTrend.data.map(point => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: point.price,
    fullDate: new Date(point.date)
  }));
  
  // Sort data by date
  chartData.sort((a, b) => a.fullDate - b.fullDate);
  
  // Calculate price statistics
  const calculateStats = () => {
    const prices = chartData.map(point => point.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    // Current trend (comparing last 2 points)
    let trend = 'stable';
    if (chartData.length >= 2) {
      const lastPrice = chartData[chartData.length - 1].price;
      const prevPrice = chartData[chartData.length - 2].price;
      
      if (lastPrice < prevPrice) {
        trend = 'decreasing';
      } else if (lastPrice > prevPrice) {
        trend = 'increasing';
      }
    }
    
    return { min, max, avg, trend };
  };
  
  const stats = calculateStats();
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Price Trends</h2>
        <select 
          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          value={selectedRoute}
          onChange={(e) => setSelectedRoute(e.target.value)}
        >
          {priceTrends.map(trend => (
            <option key={trend.route} value={trend.route}>
              {trend.route}
            </option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-500">Min Price</p>
          <p className="text-lg font-semibold text-gray-800">{formatCurrency(stats.min)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-500">Max Price</p>
          <p className="text-lg font-semibold text-gray-800">{formatCurrency(stats.max)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-500">Average</p>
          <p className="text-lg font-semibold text-gray-800">{formatCurrency(stats.avg)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-500">Current Trend</p>
          <p className={`text-lg font-semibold ${
            stats.trend === 'decreasing' 
              ? 'text-green-600' 
              : stats.trend === 'increasing' 
                ? 'text-red-600' 
                : 'text-gray-800'
          }`}>
            {stats.trend === 'decreasing' 
              ? '↓ Falling' 
              : stats.trend === 'increasing' 
                ? '↑ Rising' 
                : '→ Stable'}
          </p>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ stroke: '#2563eb', strokeWidth: 2, r: 4 }}
              activeDot={{ stroke: '#1e40af', strokeWidth: 2, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;