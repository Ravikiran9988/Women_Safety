import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable. Add it to .env.');
}

export const connectDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    console.info('🧪 Test mode enabled — MongoDB connection skipped');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.info('✅ MongoDB connected to Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
});

mongoose.connection.on('reconnected', () => {
  console.info('🔄 MongoDB reconnected');
});