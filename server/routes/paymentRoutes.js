const express = require('express');
const { createRazorpayOrder, verifyRazorpayPayment, handleRazorpayWebhook } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Razorpay webhook — receives raw JSON body from Razorpay servers
// Must be authenticated by HMAC signature, not by JWT
router.post('/webhook', handleRazorpayWebhook);

// Create a Razorpay order for a locked booking (requires auth)
router.post('/create-order', protect, createRazorpayOrder);

// Verify Razorpay payment signature after popup closes (requires auth)
router.post('/verify', protect, verifyRazorpayPayment);

module.exports = router;
