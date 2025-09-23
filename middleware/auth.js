const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Rate limiting helper
const createRateLimit = (maxRequests, windowMs) => {
  const requests = new Map();

  return (identifier) => {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [key, timestamps] of requests.entries()) {
      requests.set(key, timestamps.filter(time => time > windowStart));
      if (requests.get(key).length === 0) {
        requests.delete(key);
      }
    }

    // Check current requests
    const userRequests = requests.get(identifier) || [];

    if (userRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }

    // Add current request
    userRequests.push(now);
    requests.set(identifier, userRequests);

    return true;
  };
};

// Create rate limiter instances
const loginRateLimit = createRateLimit(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
const generalRateLimit = createRateLimit(100, 15 * 60 * 1000); // 100 requests per 15 minutes

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please provide a valid Bearer token'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Token is required'
      });
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed',
          message: 'User not found'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Account deactivated',
          message: 'Your account has been deactivated'
        });
      }

      // Add user to request object
      req.user = user;
      next();

    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          message: 'Your session has expired. Please log in again'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          message: 'The provided token is invalid'
        });
      } else {
        throw jwtError;
      }
    }

  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Authentication failed due to server error'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token provided)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Ignore token errors for optional auth
    }

    next();
  } catch (error) {
    next(); // Continue even if there's an error
  }
};

// Rate limiting middleware
const rateLimiter = (maxRequests, windowMs) => {
  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress || 'unknown';

    if (!generalRateLimit(identifier)) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: 'Too many requests from this IP, please try again later'
      });
    }

    next();
  };
};

// Admin only middleware
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied',
      message: 'Admin privileges required'
    });
  }

  next();
};

// User ownership middleware (for resources that belong to users)
const requireOwnership = (userIdField = 'createdBy') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    // Allow admins to access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if the resource belongs to the current user
    const resourceUserId = req.body[userIdField] || req.params[userIdField] || req.query[userIdField];

    if (resourceUserId && resourceUserId.toString() === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Access denied',
      message: 'You can only access your own resources'
    });
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  rateLimiter,
  requireAdmin,
  requireOwnership
};