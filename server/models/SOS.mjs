import mongoose from 'mongoose';

const sosSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // null for guest users
  },
  mode: {
    type: String,
    enum: ['guest', 'user'],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active',
  },
  profile: {
    name: String,
    phone: String,
  },
  initialLocation: {
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
  lastLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    timestamp: Date,
  },
  assignedResponder: {
    type: String,
    required: false,
  },
  assignedTime: {
    type: Date,
    required: false,
  },
  resolvedAt: {
    type: Date,
    required: false,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
sosSchema.index({ status: 1, createdAt: -1 });
sosSchema.index({ userId: 1, status: 1 });

export const SOS = mongoose.model('SOS', sosSchema);