// server/utils/logger.js
const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'flight-price-tracker' },
  transports: [
    // Write logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}`
        )
      )
    })
  ]
});

// If in production, also log to file
if (process.env.NODE_ENV === 'production') {
  // Create logs directory if it doesn't exist
  const fs = require('fs');
  const logsDir = path.join(__dirname, '../logs');
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }
  
  logger.add(new winston.transports.File({ 
    filename: path.join(logsDir, 'error.log'), 
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }));
  
  logger.add(new winston.transports.File({ 
    filename: path.join(logsDir, 'combined.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }));
}

// Add request logging middleware for Express
logger.middleware = (req, res, next) => {
  // Skip logging for static assets
  if (req.path.startsWith('/static/') || req.path.startsWith('/assets/')) {
    return next();
  }
  
  const start = new Date();
  
  res.on('finish', () => {
    const duration = new Date() - start;
    
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: duration,
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    });
  });
  
  next();
};

// Helper methods
logger.logApiError = (message, error, req = null) => {
  const logObj = {
    message,
    errorMessage: error.message,
    stack: error.stack
  };
  
  // Add request info if available
  if (req) {
    logObj.method = req.method;
    logObj.url = req.originalUrl;
    logObj.params = req.params;
    logObj.query = req.query;
    logObj.userId = req.session?.userId;
  }
  
  // Add API response info if available
  if (error.response) {
    logObj.statusCode = error.response.status;
    logObj.statusText = error.response.statusText;
    logObj.data = error.response.data;
  }
  
  logger.error(logObj);
};

logger.logDatabaseError = (message, error, query = null) => {
  logger.error({
    message,
    errorMessage: error.message,
    stack: error.stack,
    query,
    code: error.code,
    detail: error.detail
  });
};

module.exports = logger;