const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const { errorResponse } = require('../utils/responseFormatter');

/**
 * Protect routes by verifying JWT token
 */
const verifyToken = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'];
  }

  if (!token) {
    return errorResponse(res, 'Access denied. Authentication token missing.', 401);
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Find user in DB or provide verified payload
    let user = null;
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch {
        // If DB lookup fails during quick mode, use decoded payload
      }
    }

    if (!user) {
      // In-memory / decoded token fallback for stateless JWTs
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || 'Authenticated User',
        email: decoded.email,
        role: decoded.role || 'citizen',
      };
    } else {
      req.user = user;
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token has expired. Please log in again.', 401);
    }
    return errorResponse(res, 'Invalid authentication token.', 401);
  }
};

/**
 * Require specific role(s) for route access (RBAC)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized. Please authenticate first.', 401);
    }

    if (!roles.includes(req.user.role) && req.user.role !== 'admin') {
      return errorResponse(
        res,
        `Access forbidden. Role '${req.user.role}' is not authorized to access this resource.`,
        403
      );
    }

    next();
  };
};

/**
 * Optional authentication: attach user if token present, but don't reject
 */
const optionalAuth = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user;
    } else {
      req.user = decoded;
    }
  } catch {
    // Ignore invalid token in optional auth
  }

  next();
};

module.exports = {
  verifyToken,
  requireRole,
  optionalAuth,
};
