const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');
const Razorpay = require('razorpay');
const Booking = require('../models/Booking');

exports.createStripePaymentIntent = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate('room');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '[BOOKING_NOT_FOUND] Cannot create payment intent for non-existent booking.',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100), // cents
      currency: 'usd',
      metadata: {
        bookingId: booking._id.toString(),
        guestId: req.user.id,
      },
    });

    booking.stripePaymentIntentId = paymentIntent.id;
    await booking.save();

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    next(error);
  }
};

// Stripe Webhook Endpoint — receives express.raw() buffer
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy';

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`[WEBHOOK_ERROR] Stripe signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const bookingId = paymentIntent.metadata.bookingId;

    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        status: 'CONFIRMED',
      });
      console.log(`[WEBHOOK] Booking ${bookingId} confirmed via Stripe webhook.`);
    }
  }

  res.status(200).json({ received: true });
};
