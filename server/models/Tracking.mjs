import mongoose from 'mongoose';

const trackingSchema = new mongoose.Schema({
  sosId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SOS',
    required: true,
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
      required: false,
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
trackingSchema.index({ sosId: 1, timestamp: -1 });

export const Tracking = mongoose.model('Tracking', trackingSchema);