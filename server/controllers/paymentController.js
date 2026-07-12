const crypto = require('crypto');
const Razorpay = require('razorpay');
const Booking = require('../models/Booking');
const { getRedisClient } = require('../config/redis');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// USD to INR fixed conversion rate
const USD_TO_INR = 85;

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order for a locked booking and returns the order details
 * needed to open the frontend checkout popup.
 */
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: '[PAYMENT_ERROR] bookingId is required.',
      });
    }

    const booking = await Booking.findById(bookingId).populate('room');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '[BOOKING_NOT_FOUND] Cannot create payment order for non-existent booking.',
      });
    }

    if (booking.guest.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '[AUTH_ERROR] You are not authorized to pay for this booking.',
      });
    }

    // Convert USD → INR → paise (Razorpay requires smallest currency unit)
    const amountInPaise = Math.round(booking.totalAmount * USD_TO_INR * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        guestId: req.user.id,
        roomTitle: booking.room?.title || 'StayWise Suite',
      },
    });

    // Persist the Razorpay order ID on the booking record
    booking.razorpayOrderId = order.id;
    booking.paymentGateway = 'RAZORPAY';
    await booking.save();

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,           // in paise
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingId: booking._id,
      // Pre-fill data for Razorpay popup
      prefill: {
        name: req.user.name,
        email: req.user.email,
        contact: req.user.phone || '',
      },
      description: `StayWise — ${booking.room?.title || 'Suite'} · ${booking.totalAmount} USD`,
    });
  } catch (error) {
    console.error('[RAZORPAY_ORDER_ERROR]', error);
    next(error);
  }
};

/**
 * POST /api/payments/verify
 * Called by the frontend immediately after Razorpay popup returns success.
 * Verifies the payment signature using HMAC-SHA256, then confirms the booking.
 */
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({
        success: false,
        message: '[VERIFY_ERROR] Missing required payment verification fields.',
      });
    }

    // HMAC-SHA256 signature verification
    // Razorpay signs: razorpay_order_id + "|" + razorpay_payment_id
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('[VERIFY_ERROR] Signature mismatch — possible tampered payload.');
      try {
        const failedBooking = await Booking.findById(bookingId);
        if (failedBooking && failedBooking.status === 'PENDING_SLOT_LOCK') {
          failedBooking.status = 'CANCELLED';
          await failedBooking.save();
          const redis = getRedisClient();
          const checkIn = new Date(failedBooking.checkInDate).toISOString().slice(0, 10);
          await redis.del(`lock:room:${failedBooking.room}:${checkIn}`);
        }
      } catch (cancelErr) {
        console.warn('[REDIS_WARN] Could not release slot lock on verify mismatch:', cancelErr.message);
      }
      return res.status(400).json({
        success: false,
        message: '[VERIFY_ERROR] Payment signature verification failed. Contact support.',
      });
    }

    // Signature verified — confirm the booking
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        status: 'CONFIRMED',
        razorpayPaymentId: razorpay_payment_id,
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '[BOOKING_NOT_FOUND] Booking not found after payment verification.',
      });
    }

    // Release the Redis slot lock since payment is complete
    try {
      const redis = getRedisClient();
      const checkIn = new Date(booking.checkInDate).toISOString().slice(0, 10);
      const lockKey = `lock:room:${booking.room}:${checkIn}`;
      await redis.del(lockKey);
    } catch (redisErr) {
      console.warn('[REDIS_WARN] Could not release slot lock after payment:', redisErr.message);
    }

    console.log(`[PAYMENT_VERIFIED] Booking ${bookingId} confirmed. Payment: ${razorpay_payment_id}`);

    res.status(200).json({
      success: true,
      message: 'Payment verified. Booking is confirmed.',
      bookingId: booking._id,
    });
  } catch (error) {
    console.error('[VERIFY_PAYMENT_ERROR]', error);
    next(error);
  }
};

/**
 * POST /api/payments/webhook
 * Razorpay sends events here (payment.captured, payment.failed).
 * Acts as a safety net — the /verify endpoint is the primary confirmation path.
 */
exports.handleRazorpayWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  // Verify Razorpay webhook signature
  if (webhookSecret && signature) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('[WEBHOOK_ERROR] Razorpay webhook signature mismatch.');
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }
  }

  const event = req.body.event;
  const payload = req.body.payload?.payment?.entity;

  if (event === 'payment.captured' && payload) {
    const orderId = payload.order_id;
    const paymentId = payload.id;

    try {
      const booking = await Booking.findOne({ razorpayOrderId: orderId });

      if (booking && booking.status !== 'CONFIRMED') {
        booking.status = 'CONFIRMED';
        booking.razorpayPaymentId = paymentId;
        await booking.save();
        console.log(`[WEBHOOK] Booking ${booking._id} confirmed via webhook. Payment: ${paymentId}`);
      }
    } catch (err) {
      console.error('[WEBHOOK_DB_ERROR]', err.message);
    }
  }

  if (event === 'payment.failed' && payload) {
    const orderId = payload.order_id;
    console.warn(`[WEBHOOK] Payment failed for order ${orderId}. Cancelling booking lock.`);
    try {
      const booking = await Booking.findOne({ razorpayOrderId: orderId });
      if (booking && booking.status === 'PENDING_SLOT_LOCK') {
        booking.status = 'CANCELLED';
        await booking.save();
        const redis = getRedisClient();
        const checkIn = new Date(booking.checkInDate).toISOString().slice(0, 10);
        await redis.del(`lock:room:${booking.room}:${checkIn}`);
        console.log(`[WEBHOOK] Released slot lock for booking ${booking._id} after payment failure.`);
      }
    } catch (err) {
      console.error('[WEBHOOK_FAIL_ERROR]', err.message);
    }
  }

  res.status(200).json({ received: true });
};
