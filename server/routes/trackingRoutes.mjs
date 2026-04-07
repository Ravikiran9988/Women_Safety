import express from 'express';
import {
  saveTracking,
  getTrackingBySOS,
  getLatestTracking,
  getTrackingSummary
} from '../controllers/trackingController.mjs';

const router = express.Router();

// POST /api/tracking - Save a tracking update
router.post('/', saveTracking);

// GET /api/tracking/sos/:sosId - Get tracking data for a specific SOS
router.get('/sos/:sosId', getTrackingBySOS);

// GET /api/tracking/latest - Get latest tracking point (global or per SOS)
router.get('/latest', getLatestTracking);

// GET /api/tracking/summary - Get tracking summary for all active SOS
router.get('/summary', getTrackingSummary);

export default router;