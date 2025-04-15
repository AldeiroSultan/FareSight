// server/utils/logger.js
// Simple logger implementation

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Simple logger
const logger = {
  info: (message, data = null) => {
    console.log(`${colors.blue}[INFO]${colors.reset} ${message}`);
    if (data) console.log(data);
  },
  
  warn: (message, data = null) => {
    console.log(`${colors.yellow}[WARN]${colors.reset} ${message}`);
    if (data) console.log(data);
  },
  
  error: (message, data = null) => {
    console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
    if (data) console.log(data);
  },
  
  debug: (message, data = null) => {
    if (process.env.DEBUG) {
      console.log(`${colors.gray}[DEBUG]${colors.reset} ${message}`);
      if (data) console.log(data);
    }
  },
  
  success: (message, data = null) => {
    console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
    if (data) console.log(data);
  },
  
  // For express middleware
  middleware: (req, res, next) => {
    const start = new Date();
    res.on('finish', () => {
      const duration = new Date() - start;
      const statusColor = res.statusCode < 400 ? colors.green : colors.red;
      console.log(
        `${colors.cyan}[HTTP]${colors.reset} ${req.method} ${req.originalUrl} ${statusColor}${res.statusCode}${colors.reset} ${duration}ms`
      );
    });
    next();
  },
  
  // Custom methods for Amadeus errors
  logApiError: (message, error) => {
    logger.error(`${message}: ${error.message}`);
    if (error.response) {
      console.log(`${colors.red}Response:${colors.reset}`, error.response);
    }
  }
};

module.exports = logger;