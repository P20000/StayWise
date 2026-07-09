const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1.0,
      max: 5.0,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    verifiedStay: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// One review per guest per room constraint
reviewSchema.index({ room: 1, guest: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
