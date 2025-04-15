// server/services/email/index.js
const { Resend } = require('resend');
const logger = require('../../utils/logger');

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY || 're_AdHrHtRy_HQkSx7ahNCFmAtTgGhqc866i');

/**
 * Send a price alert email
 * @param {Object} user - User object with email, firstName
 * @param {Object} alert - Alert object with route, price, date details
 * @param {string} alertType - 'PRICE_DROP' or 'MISTAKE_FARE'
 * @param {number} percentageChange - Percentage change in price
 * @returns {Promise<boolean>} Success status
 */
const sendPriceAlertEmail = async (user, alert, alertType, percentageChange) => {
  try {
    // Format prices for display
    const currentPrice = `$${alert.price.toFixed(2)}`;
    const previousPrice = `$${alert.previousPrice.toFixed(2)}`;
    const percentChange = Math.abs(percentageChange).toFixed(1);
    
    // Create subject line based on alert type
    const subject = alertType === 'MISTAKE_FARE'
      ? `🔥 MISTAKE FARE ALERT: ${alert.origin.code} to ${alert.destination.code} for ${currentPrice}!`
      : `✈️ Price Alert: ${alert.origin.code} to ${alert.destination.code} dropped ${percentChange}%`;
    
    // Format dates
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    };
    
    const departureDate = formatDate(alert.departureDate);
    const returnDate = alert.returnDate ? formatDate(alert.returnDate) : null;
    const tripType = returnDate ? 'Round Trip' : 'One Way';
    
    // Create HTML content for email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2b5afc; padding: 20px; color: white; text-align: center;">
          <h1 style="margin: 0;">Flight Price Alert</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
          <p>Hello ${user.firstName},</p>
          
          <p>Good news! We've detected a significant price change for your tracked flight:</p>
          
          <div style="background-color: white; border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <h2 style="color: #2b5afc; margin-top: 0;">${alert.origin.code} to ${alert.destination.code}</h2>
            <p><strong>From:</strong> ${alert.origin.name}</p>
            <p><strong>To:</strong> ${alert.destination.name}</p>
            <p><strong>Date:</strong> ${departureDate}</p>
            ${returnDate ? `<p><strong>Return:</strong> ${returnDate}</p>` : ''}
            <p><strong>Trip Type:</strong> ${tripType}</p>
            
            <div style="margin: 15px 0; border-top: 1px solid #eee; padding-top: 15px;">
              <p style="font-size: 20px; font-weight: bold; color: #2b5afc;">
                New Price: ${currentPrice}
              </p>
              <p style="text-decoration: line-through; color: #777;">
                Previous Price: ${previousPrice}
              </p>
              <p style="color: #28a745; font-weight: bold;">
                You Save: ${percentChange}% (${(alert.previousPrice - alert.price).toFixed(2)})
              </p>
            </div>
          </div>
          
          ${alertType === 'MISTAKE_FARE' ? 
            `<p><strong>⚠️ This appears to be a mistake fare!</strong> These fares typically don't last long, so book quickly if you're interested.</p>` : 
            `<p>This price is now below your alert threshold. We recommend booking soon as prices can change rapidly.</p>`
          }
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="http://${process.env.CLIENT_URL || 'localhost:3000'}/flights/search?origin=${alert.origin.code}&destination=${alert.destination.code}&departureDate=${alert.departureDate}${alert.returnDate ? `&returnDate=${alert.returnDate}` : ''}" 
               style="background-color: #2b5afc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Flight Details
            </a>
          </div>
          
          <p>Safe travels,</p>
          <p>The Flight Price Tracker Team</p>
        </div>
        
        <div style="padding: 15px; text-align: center; font-size: 12px; color: #777;">
          <p>You're receiving this email because you set up a price alert for this route.</p>
          <p>
            <a href="http://${process.env.CLIENT_URL || 'localhost:3000'}/account/alerts" style="color: #2b5afc;">
              Manage your alerts
            </a>
          </p>
        </div>
      </div>
    `;
    
    // Send email with Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'alerts@flightpricetracker.com',
      to: user.email,
      subject: subject,
      html: htmlContent
    });
    
    if (error) {
      logger.error('Email sending error:', error);
      return false;
    }
    
    logger.info(`Price alert email sent to ${user.email} for ${alert.origin.code} to ${alert.destination.code}`);
    return true;
  } catch (err) {
    logger.error('Error sending price alert email:', err);
    return false;
  }
};

/**
 * Send a welcome email to new users
 * @param {Object} user - User object with email, firstName
 * @returns {Promise<boolean>} Success status
 */
const sendWelcomeEmail = async (user) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2b5afc; padding: 20px; color: white; text-align: center;">
          <h1 style="margin: 0;">Welcome to Flight Price Tracker!</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
          <p>Hello ${user.firstName},</p>
          
          <p>Thank you for signing up for Flight Price Tracker. We're excited to help you find the best flight deals!</p>
          
          <h2>Getting Started</h2>
          
          <p>Here's how to make the most of your new account:</p>
          
          <ol>
            <li><strong>Set up price alerts</strong> for your favorite routes</li>
            <li><strong>Track historical prices</strong> to find the best time to book</li>
            <li><strong>Get notified</strong> when prices drop or when we detect special "mistake fares"</li>
            <li><strong>Customize your alert settings</strong> in your account preferences</li>
          </ol>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="http://${process.env.CLIENT_URL || 'localhost:3000'}/dashboard" 
               style="background-color: #2b5afc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Go to Your Dashboard
            </a>
          </div>
          
          <p>Happy travels,</p>
          <p>The Flight Price Tracker Team</p>
        </div>
        
        <div style="padding: 15px; text-align: center; font-size: 12px; color: #777;">
          <p>You're receiving this email because you recently signed up for Flight Price Tracker.</p>
        </div>
      </div>
    `;
    
    // Send email with Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'welcome@flightpricetracker.com',
      to: user.email,
      subject: 'Welcome to Flight Price Tracker! 🛫',
      html: htmlContent
    });
    
    if (error) {
      logger.error('Welcome email sending error:', error);
      return false;
    }
    
    logger.info(`Welcome email sent to ${user.email}`);
    return true;
  } catch (err) {
    logger.error('Error sending welcome email:', err);
    return false;
  }
};

module.exports = {
  sendPriceAlertEmail,
  sendWelcomeEmail
};