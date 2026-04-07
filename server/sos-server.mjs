/**
 * SOS API Server with MongoDB integration for women safety tracking.
 * Run: node server/sos-server.mjs
 * Use EXPO_PUBLIC_SOS_API_URL=http://<your-lan-ip>:3000/api/sos on a physical device.
 */
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './database.mjs';
import { SOS } from './models/SOS.mjs';
import { Tracking } from './models/Tracking.mjs';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// ✅ 1. CORS — must be first, before everything
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
  preflightContinue: false, // ✅ this handles preflight automatically
}));

// ✅ 3. Body parser
app.use(express.json());

// ✅ 4. Connect to MongoDB
connectDB().then(() => {
  // ✅ Start server only after DB connects
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SOS API Server listening on http://0.0.0.0:${PORT}`);
    console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log(`📍 Available endpoints:`);
    console.log(`   POST /api/admin/login       - Admin login`);
    console.log(`   POST /api/sos               - SOS alerts and tracking`);
    console.log(`   GET  /api/latest            - Latest tracking point`);
    console.log(`   GET  /api/tracking/:sosId   - All tracking for SOS`);
    console.log(`   GET  /api/active-sos        - Active SOS records`);
    console.log(`   PUT  /api/sos/:sosId/resolve - Resolve SOS`);
    console.log(`   GET  /health                - Health check`);
  });
}).catch((err) => {
  console.error('❌ Failed to connect to MongoDB:', err);
  process.exit(1);
});

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

/**
 * POST /api/admin/login
 * Admin authentication
 */
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        error: 'Email and password are required',
      });
    }

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error('❌ ADMIN_EMAIL or ADMIN_PASSWORD not set in .env');
      return res.status(500).json({
        ok: false,
        error: 'Server misconfiguration: admin credentials not set',
      });
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        ok: false,
        error: 'Invalid email or password',
      });
    }

    console.log('✅ Admin logged in:', email);
    return res.json({
      ok: true,
      message: 'Login successful',
    });

  } catch (error) {
    console.error('❌ Admin login error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/sos
 * Handle SOS alerts and tracking updates
 */
app.post('/api/sos', async (req, res) => {
  try {
    const { type, timestamp, location, profile, mode, sosId } = req.body;

    console.log(`[${type?.toUpperCase()}]`, new Date().toISOString(), JSON.stringify(req.body, null, 2));

    if (type === 'sos') {
      // Create new SOS record
      const sosData = {
        mode,
        profile,
        initialLocation: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracyMeters,
        } : null,
      };

      const newSOS = new SOS(sosData);
      const savedSOS = await newSOS.save();

      console.log('✅ SOS created:', savedSOS._id);
      return res.json({
        ok: true,
        sosId: savedSOS._id,
        message: 'SOS alert created successfully',
      });

    } else if (type === 'tracking') {
      // ✅ Validate sosId
      if (!sosId) {
        return res.status(400).json({
          ok: false,
          error: 'sosId is required for tracking updates',
        });
      }

      // ✅ Validate location before accessing its properties
      if (!location || location.latitude == null || location.longitude == null) {
        return res.status(400).json({
          ok: false,
          error: 'Valid location (latitude, longitude) is required for tracking updates',
        });
      }

      const trackingData = {
        sosId,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracyMeters,
        },
        // ✅ Fallback to current time if timestamp is missing or invalid
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      };

      const newTracking = new Tracking(trackingData);
      await newTracking.save();

      console.log('📍 Tracking saved for SOS:', sosId);
      return res.json({
        ok: true,
        message: 'Tracking update saved',
      });

    } else {
      return res.status(400).json({
        ok: false,
        error: 'Invalid type. Must be "sos" or "tracking"',
      });
    }

  } catch (error) {
    console.error('❌ SOS API error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/latest
 * Get the latest tracking point
 */
app.get('/api/latest', async (req, res) => {
  try {
    // ✅ Removed redundant .limit(1) — findOne() already returns one document
    const latestTracking = await Tracking.findOne()
      .sort({ timestamp: -1 })
      .populate('sosId', 'mode profile status');

    if (!latestTracking) {
      return res.json({
        ok: true,
        data: null,
        message: 'No tracking data found',
      });
    }

    // ✅ Safe access — sosId may be null if the SOS was deleted
    res.json({
      ok: true,
      data: {
        sosId: latestTracking.sosId?._id ?? null,
        location: latestTracking.location,
        timestamp: latestTracking.timestamp,
        sos: latestTracking.sosId ?? null,
      },
    });

  } catch (error) {
    console.error('❌ Latest tracking error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch latest tracking',
    });
  }
});

/**
 * GET /api/tracking/:sosId
 * Get all tracking points for a specific SOS
 */
app.get('/api/tracking/:sosId', async (req, res) => {
  try {
    const { sosId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sosId)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid SOS ID',
      });
    }

    const trackingPoints = await Tracking.find({ sosId })
      .sort({ timestamp: 1 })
      .select('location timestamp');

    res.json({
      ok: true,
      data: trackingPoints,
      count: trackingPoints.length,
    });

  } catch (error) {
    console.error('❌ Tracking fetch error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch tracking data',
    });
  }
});

/**
 * GET /api/active-sos
 * Get all active SOS records
 */
app.get('/api/active-sos', async (req, res) => {
  try {
    const activeSOS = await SOS.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .select('mode profile initialLocation createdAt');

    res.json({
      ok: true,
      data: activeSOS,
      count: activeSOS.length,
    });

  } catch (error) {
    console.error('❌ Active SOS fetch error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch active SOS records',
    });
  }
});

/**
 * PUT /api/sos/:sosId/resolve
 * Mark an SOS as resolved
 */
app.put('/api/sos/:sosId/resolve', async (req, res) => {
  try {
    const { sosId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sosId)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid SOS ID',
      });
    }

    const updatedSOS = await SOS.findByIdAndUpdate(
      sosId,
      { status: 'resolved' },
      { new: true }
    );

    if (!updatedSOS) {
      return res.status(404).json({
        ok: false,
        error: 'SOS not found',
      });
    }

    console.log('✅ SOS resolved:', sosId);
    res.json({
      ok: true,
      message: 'SOS marked as resolved',
      data: updatedSOS,
    });

  } catch (error) {
    console.error('❌ SOS resolve error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to resolve SOS',
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ─────────────────────────────────────────────
// FALLBACK HANDLERS (must be last)
// ─────────────────────────────────────────────

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Endpoint not found',
  });
});

/**
 * Global error handler
 */
app.use((error, req, res, _next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    ok: false,
    error: 'Internal server error',
  });
});
