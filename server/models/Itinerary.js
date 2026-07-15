const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['DISPATCHED', 'PROCESSING', 'LOCKED', 'BOOKED', 'CANCELLED', 'FAILED'],
      default: 'DISPATCHED',
      index: true,
    },
    meta: {
      origin: { type: String },
      destination: { type: String },
      start_date: { type: String },
      end_date: { type: String },
      vibe: { type: String },
      pax: { type: Number, default: 1 },
      prompt: { type: String },
    },
    pipeline: {
      flight_agent: {
        required: { type: Boolean, default: true },
        cabin_class: { type: String, default: 'economy' },
      },
      stay_agent: {
        required: { type: Boolean, default: true },
        hotel_tier: { type: String, default: 'premium_vibe' },
      },
      transit_agent: {
        required: { type: Boolean, default: true },
        mode: { type: String, default: 'private_cab_rental' },
      },
      experience_agent: {
        required: { type: Boolean, default: true },
        intensity: { type: String, default: 'relaxed' },
      },
    },
    subAgentData: {
      flights: { type: mongoose.Schema.Types.Mixed },
      stays: { type: mongoose.Schema.Types.Mixed },
      transit: { type: mongoose.Schema.Types.Mixed },
      activities: { type: mongoose.Schema.Types.Mixed },
    },
    manifestToken: {
      breakdown: {
        transit_total_inr: { type: Number, default: 0 },
        stay_total_inr: { type: Number, default: 0 },
        activities_total_inr: { type: Number, default: 0 },
        taxes_gst_inr: { type: Number, default: 0 },
      },
      staywise_fee_inr: { type: Number, default: 0 },
      grand_total_payable_inr: { type: Number, default: 0 },
      price_lock_ttl_seconds: { type: Number, default: 300 }, // 5 minutes price lock
    },
    lockExpiry: {
      type: Date,
      index: true,
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly query active locked itineraries or clean up expired locks
itinerarySchema.index({ status: 1, lockExpiry: 1 });

module.exports = mongoose.model('Itinerary', itinerarySchema);
