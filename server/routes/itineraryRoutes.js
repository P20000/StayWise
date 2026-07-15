const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  chatBotMessage,
  createItinerary,
  streamTelemetry,
  getItinerary,
  chatItinerary,
  createItineraryPaymentOrder,
  verifyItineraryPayment,
} = require('../controllers/itineraryController');

// Optional auth helper to attach req.user if token is present, without blocking guest demos
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.cookies && req.cookies.staywise_jwt) {
      token = req.cookies.staywise_jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_PRIVATE_SECRET || 'local_development_jwt_secret_key_change_in_prod'
      );
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (err) {
    // Ignore invalid/expired tokens for optionalAuth
  }
  next();
};

// Clean simple chatbot routes
router.post('/', optionalAuth, chatBotMessage);
router.post('/chat', optionalAuth, chatBotMessage);
router.post('/create', optionalAuth, createItinerary);
router.post('/:jobId/chat', optionalAuth, chatItinerary);
router.get('/stream/:jobId', streamTelemetry);
router.post('/:jobId/pay-order', optionalAuth, createItineraryPaymentOrder);
router.post('/:jobId/pay-verify', optionalAuth, verifyItineraryPayment);
router.get('/:jobId', optionalAuth, getItinerary);

module.exports = router;
