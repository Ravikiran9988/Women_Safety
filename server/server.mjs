console.log('🚀 Starting SOS API Server...');
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './database.mjs';
import { errorHandler } from './middleware/errorHandler.mjs';
import { getActiveSOS, resolveSOS } from './controllers/sosController.mjs';
import { getTrackingBySOS, getLatestTracking } from './controllers/trackingController.mjs';

// Import routes
import userRoutes from './routes/userRoutes.mjs';
import sosRoutes from './routes/sosRoutes.mjs';
import trackingRoutes from './routes/trackingRoutes.mjs';
import atlasRoutes from './routes/atlasRoutes.mjs';
import adminRoutes from './routes/adminRoutes.mjs';

// Load environment variables from root .env first, then server/.env for server-only secrets
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env'), override: false });

const app = express();
const PORT = Number(process.env.PORT ?? 3000);
const NODE_ENV = process.env.NODE_ENV ?? 'development';

app.set('trust proxy', 1);

// ✅ 1. CORS — must be FIRST before everything
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://192.168.0.122:5173,http://192.168.0.122:5174').split(',').map((origin) => origin.trim()).filter(Boolean);
const lanOriginPattern = /^https?:\/\/192\.168\.\d+\.\d+:(5173|5174)$/;
console.log('🧩 CORS allowed origins:', allowedOrigins);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      // React Native and some mobile browsers do not send Origin header
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin) || lanOriginPattern.test(origin)) {
      return callback(null, true);
    }
    console.warn('⚠️  CORS denied for origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
  preflightContinue: false,
}));

// ✅ 2. Security middleware
app.use(helmet());

// ✅ 3. Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ 4. Request logging
app.use(morgan('combined'));
app.use((req, res, next) => {
  console.log('📨 ' + req.method + ' ' + req.url);
  next();
});

// ✅ 5. Connect to MongoDB Atlas
connectDB();

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('🔍 Health endpoint hit');
  const mongoState = mongoose.connection.readyState === 1
    ? 'connected'
    : mongoose.connection.readyState === 2
      ? 'connecting'
      : 'disconnected';

  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
    mongodb: mongoState,
    version: '2.0.0',
    environment: NODE_ENV,
  });
});

// API Routes
app.use('/api/admin', adminRoutes);
console.log('📋 Admin routes registered');
app.use('/api/users', userRoutes);
console.log('📋 User routes registered');
app.use('/api/sos', sosRoutes);
console.log('📋 SOS routes registered');
app.use('/api/tracking', trackingRoutes);
console.log('📋 Tracking routes registered');
app.use('/api/test-atlas', atlasRoutes);
console.log('📋 Atlas routes registered');

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  console.log('🔍 Test endpoint hit');
  res.json({
    ok: true,
    message: 'SOS API Server is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});

// Legacy endpoints for backward compatibility
app.get('/api/latest', getLatestTracking);
app.get('/api/tracking/:sosId', getTrackingBySOS);
app.get('/api/active-sos', getActiveSOS);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Endpoint not found',
    method: req.method,
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SOS API Server v2.0.0 listening on http://0.0.0.0:${PORT}`);
  console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 Available endpoints:`);
  console.log(`   POST /api/admin/login              - Admin login`);
  console.log(`   GET  /api/admin/profile            - Admin profile (protected)`);
  console.log(`   GET  /api/admin/test               - Admin test endpoint`);
  console.log(`   POST /api/users                    - User management`);
  console.log(`   POST /api/sos                      - SOS alerts`);
  console.log(`   PUT  /api/sos/:id/resolve          - Resolve SOS`);
  console.log(`   GET  /api/sos/active               - Active SOS records`);
  console.log(`   GET  /api/tracking/sos/:sosId      - Tracking for SOS`);
  console.log(`   GET  /api/tracking/latest          - Latest tracking point`);
  console.log(`   GET  /api/test                     - Test endpoint`);
  console.log(`   GET  /health                       - Health check`);
});
