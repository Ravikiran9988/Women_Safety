import express from 'express';
import { adminLogin, getAdminProfile, verifyAdminToken } from '../controllers/adminController.mjs';

const router = express.Router();

// POST /api/admin/login - Admin login
router.post('/login', adminLogin);

// GET /api/admin/profile - Get the current admin profile (protected)
router.get('/profile', verifyAdminToken, getAdminProfile);

// GET /api/admin/test - Test endpoint for debugging
router.get('/test', (req, res) => {
  res.json({
    ok: true,
    message: 'Admin routes are working'
  });
});

export default router;