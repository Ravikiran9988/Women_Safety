import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 20,
  },
}, {
  timestamps: true,
});

// Note: phone field has unique: true, so index is automatically created

export const User = mongoose.model('User', userSchema);