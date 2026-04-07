import mongoose from 'mongoose';
import { Tracking } from '../models/Tracking.mjs';
import { SOS } from '../models/SOS.mjs';

/**
 * Save a tracking update
 */
export const saveTracking = async (req, res) => {
  try {
    const { sosId, location, timestamp } = req.body;

    // Validate required fields
    if (!sosId || !location || !location.latitude || !location.longitude) {
      return res.status(400).json({
        ok: false,
        error: 'sosId and location (latitude, longitude) are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(sosId)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid SOS ID'
      });
    }

    // Verify SOS exists and is active
    const sos = await SOS.findById(sosId).lean();
    if (!sos) {
      return res.status(404).json({
        ok: false,
        error: 'SOS not found'
      });
    }

    if (sos.status !== 'active') {
      return res.status(400).json({
        ok: false,
        error: 'Cannot track resolved SOS'
      });
    }

    // Create tracking record
    const trackingData = {
      sosId,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracyMeters,
      },
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    };

    const tracking = new Tracking(trackingData);
    const savedTracking = await tracking.save();

    // Update SOS last location
    await SOS.findByIdAndUpdate(sosId, {
      lastLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracyMeters,
        timestamp: trackingData.timestamp,
      }
    });

    console.log('📍 Tracking saved for SOS:', sosId);
    res.json({
      ok: true,
      message: 'Tracking update saved',
      trackingId: savedTracking._id
    });

  } catch (error) {
    console.error('❌ Save tracking error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to save tracking update'
    });
  }
};

/**
 * Get tracking data for a specific SOS
 */
export const getTrackingBySOS = async (req, res) => {
  try {
    const { sosId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sosId)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid SOS ID'
      });
    }

    // Verify SOS exists
    const sos = await SOS.findById(sosId).lean();
    if (!sos) {
      return res.status(404).json({
        ok: false,
        error: 'SOS not found'
      });
    }

    // Get tracking data (limit to last 1000 points for performance)
    const trackingPoints = await Tracking.find({ sosId })
      .sort({ timestamp: 1 })
      .select('location timestamp')
      .lean()
      .limit(1000);

    const formattedPoints = trackingPoints.map(point => ({
      latitude: point.location.latitude,
      longitude: point.location.longitude,
      accuracy: point.location.accuracy,
      timestamp: point.timestamp,
    }));

    res.json({
      ok: true,
      sosId,
      data: formattedPoints,
      count: formattedPoints.length,
      sos: {
        mode: sos.mode,
        status: sos.status,
        createdAt: sos.createdAt,
      }
    });

  } catch (error) {
    console.error('❌ Get tracking error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch tracking data'
    });
  }
};

/**
 * Get the latest tracking point (global or per SOS)
 */
export const getLatestTracking = async (req, res) => {
  try {
    const { sosId } = req.query;

    let query = {};
    if (sosId) {
      if (!mongoose.Types.ObjectId.isValid(sosId)) {
        return res.status(400).json({
          ok: false,
          error: 'Invalid SOS ID'
        });
      }
      query = { sosId };
    }

    const latestTracking = await Tracking.findOne(query)
      .sort({ timestamp: -1 })
      .populate('sosId', 'mode profile status userId')
      .lean();

    if (!latestTracking) {
      return res.json({
        ok: true,
        data: null,
        message: sosId ? 'No tracking data found for this SOS' : 'No tracking data found'
      });
    }

    res.json({
      ok: true,
      data: {
        sosId: latestTracking.sosId._id,
        location: latestTracking.location,
        timestamp: latestTracking.timestamp,
        sos: {
          mode: latestTracking.sosId.mode,
          status: latestTracking.sosId.status,
          profile: latestTracking.sosId.profile,
        }
      }
    });

  } catch (error) {
    console.error('❌ Get latest tracking error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch latest tracking'
    });
  }
};

/**
 * Get tracking summary for all active SOS
 */
export const getTrackingSummary = async (req, res) => {
  try {
    // Get all active SOS with their latest tracking point
    const activeSOS = await SOS.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .populate('userId', 'name phone')
      .lean();

    const summary = await Promise.all(
      activeSOS.map(async (sos) => {
        const latestTracking = await Tracking.findOne({ sosId: sos._id })
          .sort({ timestamp: -1 })
          .select('location timestamp')
          .lean();

        return {
          sosId: sos._id,
          mode: sos.mode,
          profile: sos.profile,
          user: sos.userId ? {
            id: sos.userId._id,
            name: sos.userId.name,
            phone: sos.userId.phone,
          } : null,
          initialLocation: sos.initialLocation,
          lastLocation: sos.lastLocation,
          latestTracking: latestTracking ? {
            location: latestTracking.location,
            timestamp: latestTracking.timestamp,
          } : null,
          createdAt: sos.createdAt,
        };
      })
    );

    res.json({
      ok: true,
      data: summary,
      count: summary.length
    });

  } catch (error) {
    console.error('❌ Get tracking summary error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch tracking summary'
    });
  }
};