const express = require('express');
const { createStripePaymentIntent, handleStripeWebhook } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Stripe Webhook MUST receive unparsed raw buffer for HMAC cryptographic verification
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// All regular payment intent operations require JWT authentication
router.post('/create-intent', protect, express.json(), createStripePaymentIntent);

module.exports = router;
