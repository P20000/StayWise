const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING_SLOT_LOCK', 'CONFIRMED', 'CANCELLED', 'REFUNDED'],
      default: 'PENDING_SLOT_LOCK',
      index: true,
    },
    paymentGateway: {
      type: String,
      enum: ['STRIPE', 'RAZORPAY'],
      default: 'STRIPE',
    },
    stripePaymentIntentId: {
      type: String,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      index: true,
    },
    lockExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent double booking overlapping dates for the exact same room
bookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
