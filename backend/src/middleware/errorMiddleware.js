const logger = require('../utils/logger');
const { errorResponse } = require('../utils/responseFormatter');

/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  const message = `Route not found: ${req.method} ${req.originalUrl}`;
  return errorResponse(res, message, 404);
};

/**
 * Centralized Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  logger.error(`Error processing ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  // Mongoose Bad ObjectId / Cast Error
  if (err.name === 'CastError') {
    return errorResponse(res, `Resource not found. Invalid ID: ${err.value}`, 404);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => el.message);
    return errorResponse(res, 'Database validation failed', 400, errors);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(res, `Duplicate field value entered: ${field}. Please use another value.`, 400);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid authentication token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Authentication token has expired', 401);
  }

  // Generic fallback
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
