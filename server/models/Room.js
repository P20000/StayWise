const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide suite title'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide geographical location'],
      index: true,
    },
    basePrice: {
      type: Number,
      required: [true, 'Please provide base nightly rate in USD'],
      min: 0,
    },
    architecturalStyle: {
      type: String,
      required: true,
      default: 'Board-Formed Concrete',
    },
    quietnessLevel: {
      type: String,
      default: 'High (`dB < 35`)',
    },
    workplaceProfile: {
      type: String,
      default: 'Dedicated Fiber & Ergonomic Task Desk',
    },
    description: {
      type: String,
      required: true,
    },
    amenities: [
      {
        type: String,
      },
    ],
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    rating: {
      type: Number,
      default: 4.95,
      min: 1.0,
      max: 5.0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    // Vector signature matching AI recommender comparison logic
    embeddingVector: {
      type: [Number],
      default: [0.9, 0.8, 0.9, 0.4],
    },
    locationCoordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [139.7016, 35.6580], // default Shibuya Tokyo
      },
    },
  },
  {
    timestamps: true,
  }
);

// Text indexes for fast location and style querying
roomSchema.index({ location: 'text', title: 'text', architecturalStyle: 'text' });
roomSchema.index({ locationCoordinates: '2dsphere' });

module.exports = mongoose.model('Room', roomSchema);
