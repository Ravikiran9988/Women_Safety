import mongoose from 'mongoose';
import { SOS } from '../models/SOS.mjs';
import { User } from '../models/User.mjs';
import { saveTracking } from './trackingController.mjs';
import { Tracking } from '../models/Tracking.mjs';

/**
 * Create a new SOS alert or forward legacy tracking requests
 */
export const createSOS = async (req, res) => {
  try {
    const { type, mode, profile, location } = req.body;

    if (type === 'tracking') {
      return saveTracking(req, res);
    }

    // Validate required fields
    if (!mode || !location || !location.latitude || !location.longitude) {
      return res.status(400).json({
        ok: false,
        error: 'Mode and location (latitude, longitude) are required'
      });
    }

    // Validate mode
    if (!['guest', 'user'].includes(mode)) {
      return res.status(400).json({
        ok: false,
        error: 'Mode must be either "guest" or "user"'
      });
    }

    let userId = null;

    // If user mode, try to find or create user
    if (mode === 'user' && profile && profile.phone) {
      let user = await User.findOne({ phone: profile.phone }).lean();

      if (!user && profile.name) {
        // Create new user if doesn't exist
        user = new User({ name: profile.name, phone: profile.phone });
        await user.save();
        console.log('👤 User auto-created:', user._id);
      }

      if (user) {
        userId = user._id;
      }
    }

    // Create SOS record
    const sosData = {
      userId,
      mode,
      profile: mode === 'user' ? profile : null,
      initialLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracyMeters,
      },
    };

    const sos = new SOS(sosData);
    const savedSOS = await sos.save();

    console.log('🚨 SOS created:', savedSOS._id, 'Mode:', mode);
    res.status(201).json({
      ok: true,
      sosId: savedSOS._id,
      message: 'SOS alert created successfully'
    });

  } catch (error) {
    console.error('❌ Create SOS error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to create SOS alert'
    });
  }
};

/**
 * Resolve an SOS alert
 */
export const resolveSOS = async (req, res) => {
  try {
    const { sosId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sosId)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid SOS ID'
      });
    }

    const updatedSOS = await SOS.findByIdAndUpdate(
      sosId,
      { status: 'resolved', resolvedAt: new Date() },
      { new: true }
    ).lean();

    if (!updatedSOS) {
      return res.status(404).json({
        ok: false,
        error: 'SOS not found'
      });
    }

    console.log('✅ SOS resolved:', sosId);
    res.json({
      ok: true,
      message: 'SOS marked as resolved',
      sos: {
        id: updatedSOS._id,
        status: updatedSOS.status,
        resolvedAt: new Date(),
      }
    });

  } catch (error) {
    console.error('❌ Resolve SOS error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to resolve SOS'
    });
  }
};

/**
 * Assign a responder to an SOS alert
 */
export const assignSOS = async (req, res) => {
  try {
    const { id } = req.params;
    const { responderType, responderName } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, error: 'Invalid SOS ID' });
    }

    if (!responderType || !responderName) {
      return res.status(400).json({ ok: false, error: 'Responder type and name are required' });
    }

    const updatedSOS = await SOS.findByIdAndUpdate(
      id,
      {
        status: 'assigned',
        assignedResponder: responderName,
        assignedTime: new Date(),
      },
      { new: true }
    ).lean();

    if (!updatedSOS) {
      return res.status(404).json({ ok: false, error: 'SOS not found' });
    }

    console.log('👮 SOS assigned:', id, responderName);
    res.json({
      ok: true,
      message: 'Responder assigned successfully',
      sos: {
        _id: updatedSOS._id,
        status: updatedSOS.status,
        assignedResponder: updatedSOS.assignedResponder,
        assignedTime: updatedSOS.assignedTime,
      }
    });
  } catch (error) {
    console.error('❌ Assign SOS error:', error);
    res.status(500).json({ ok: false, error: 'Failed to assign responder' });
  }
};

/**
 * Get all active SOS alerts
 */
export const getActiveSOS = async (req, res) => {
  try {
    const activeSOS = await SOS.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .populate('userId', 'name phone')
      .lean()
      .limit(100); // Limit results

    const formattedSOS = activeSOS.map(sos => ({
      _id: sos._id,
      id: sos._id,
      status: sos.status,
      mode: sos.mode,
      profile: sos.profile
        ? {
            ...sos.profile,
            phoneNumber: sos.profile.phone,
          }
        : null,
      user: sos.userId ? {
        id: sos.userId._id,
        name: sos.userId.name,
        phone: sos.userId.phone,
      } : null,
      initialLocation: sos.initialLocation,
      lastLocation: sos.lastLocation,
      assignedResponder: sos.assignedResponder || null,
      assignedTime: sos.assignedTime || null,
      resolvedAt: sos.resolvedAt || null,
      createdAt: sos.createdAt,
    }));

    res.json({
      ok: true,
      data: formattedSOS,
      count: formattedSOS.length
    });

  } catch (error) {
    console.error('❌ Get active SOS error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch active SOS alerts'
    });
  }
};

/**
 * Get SOS by ID
 */
export const getSOS = async (req, res) => {
  try {
    const { sosId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sosId)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid SOS ID'
      });
    }

    const sos = await SOS.findById(sosId)
      .populate('userId', 'name phone')
      .lean();

    if (!sos) {
      return res.status(404).json({
        ok: false,
        error: 'SOS not found'
      });
    }

    res.json({
      ok: true,
      sos: {
        _id: sos._id,
        id: sos._id,
        mode: sos.mode,
        status: sos.status,
        profile: sos.profile
          ? {
              ...sos.profile,
              phoneNumber: sos.profile.phone,
            }
          : null,
        user: sos.userId ? {
          id: sos.userId._id,
          name: sos.userId.name,
          phone: sos.userId.phone,
        } : null,
        initialLocation: sos.initialLocation,
        lastLocation: sos.lastLocation,
        assignedResponder: sos.assignedResponder || null,
        assignedTime: sos.assignedTime || null,
        resolvedAt: sos.resolvedAt || null,
        createdAt: sos.createdAt,
        updatedAt: sos.updatedAt,
      }
    });

  } catch (error) {
    console.error('❌ Get SOS error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch SOS'
    });
  }
};



export const getTrackingBySOS = async (req, res) => {
  try {
    const { sosId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sosId)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid SOS ID'
      });
    }

    const tracking = await Tracking.find({ sosId })
      .sort({ timestamp: 1 }) // 🔥 use timestamp (your schema)
      .lean();

    const formatted = tracking.map(t => ({
      latitude: t.location.latitude,
      longitude: t.location.longitude,
      accuracy: t.location.accuracy,
      timestamp: t.timestamp
    }));

    res.json({
      ok: true,
      data: formatted
    });

  } catch (error) {
    console.error('❌ Tracking fetch error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch tracking data'
    });
  }
};