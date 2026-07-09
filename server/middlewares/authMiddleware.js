const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check for HttpOnly Cookie (Primary Rule #5)
    if (req.cookies && req.cookies.staywise_jwt) {
      token = req.cookies.staywise_jwt;
    } 
    // 2. Check for Authorization Bearer Header (Fallback/Mobile client)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '[AUTH_ERROR] Unauthorized access. Valid staywise_jwt credential missing.',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_PRIVATE_SECRET || 'local_development_jwt_secret_key_change_in_prod'
    );

    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '[AUTH_ERROR] User associated with security token no longer exists.',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '[AUTH_ERROR] Token validation failed or expired.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `[RBAC_DENIED] Role '${req.user?.role || 'Guest'}' is not authorized for this action. Required: ${roles.join(' | ')}`,
      });
    }
    next();
  };
};

module.exports = { protect, requireRole };
