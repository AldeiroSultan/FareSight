// server/utils/priceUtils.js

/**
 * Calculate average price from historical price data
 * @param {Array} prices - Array of price values
 * @returns {number} Average price
 */
const calculateAveragePrice = (prices) => {
    if (!Array.isArray(prices) || prices.length === 0) {
      return 0;
    }
    
    const sum = prices.reduce((acc, val) => acc + val, 0);
    return sum / prices.length;
  };
  
  /**
   * Calculate percentage change between two prices
   * @param {number} oldPrice - Old price
   * @param {number} newPrice - New price
   * @returns {number} Percentage change
   */
  const calculatePercentageChange = (oldPrice, newPrice) => {
    if (oldPrice === 0) return 0;
    return ((newPrice - oldPrice) / oldPrice) * 100;
  };
  
  /**
   * Detect if a price drop is significant
   * @param {number} oldPrice - Old price
   * @param {number} newPrice - New price
   * @param {number} threshold - Percentage threshold
   * @returns {boolean} True if drop is significant
   */
  const isSignificantPriceDrop = (oldPrice, newPrice, threshold = 15) => {
    const percentChange = calculatePercentageChange(oldPrice, newPrice);
    return percentChange <= -threshold;
  };
  
  /**
   * Check if a flight price is a mistake fare
   * @param {number} price - Current price
   * @param {Array} historicalPrices - Array of historical prices
   * @param {number} threshold - Percentage threshold (default 40%)
   * @returns {boolean} True if price is a mistake fare
   */
  const isMistakeFare = (price, historicalPrices, threshold = 40) => {
    if (!historicalPrices || historicalPrices.length < 5) {
      return false; // Not enough historical data
    }
    
    const avgPrice = calculateAveragePrice(historicalPrices);
    const percentageBelow = ((avgPrice - price) / avgPrice) * 100;
    
    return percentageBelow >= threshold;
  };
  
  module.exports = {
    calculateAveragePrice,
    calculatePercentageChange,
    isSignificantPriceDrop,
    isMistakeFare
  };