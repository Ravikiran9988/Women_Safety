import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.mjs';

/**
 * Admin login
 */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Admin login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        error: 'Email and password are required'
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      console.log('❌ Admin not found:', email);
      return res.status(401).json({
        ok: false,
        error: 'Invalid email or password'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        ok: false,
        error: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: 'admin'
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '24h' }
    );

    console.log('✅ Admin login successful:', email);

    res.json({
      ok: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email
      }
    });

  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({
      ok: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Verify admin token middleware
 */
export const verifyAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    req.admin = decoded;
    next();
  } catch (error) {
    console.error('❌ Admin token verification failed:', error);
    return res.status(401).json({
      ok: false,
      error: 'Invalid or expired token'
    });
  }
};

/**
 * Get admin profile
 */
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(404).json({
        ok: false,
        error: 'Admin not found'
      });
    }

    res.json({
      ok: true,
      admin
    });
  } catch (error) {
    console.error('❌ Get admin profile error:', error);
    res.status(500).json({
      ok: false,
      error: 'Internal server error'
    });
  }
};