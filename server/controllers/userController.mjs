import { User } from '../models/User.mjs';

/**
 * Create a new user
 */
export const createUser = async (req, res) => {
  try {
    const { name, phone } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({
        ok: false,
        error: 'Name and phone are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(409).json({
        ok: false,
        error: 'User with this phone number already exists',
        user: existingUser
      });
    }

    // Create new user
    const user = new User({ name, phone });
    const savedUser = await user.save();

    console.log('👤 User created:', savedUser._id);
    res.status(201).json({
      ok: true,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        phone: savedUser.phone,
        createdAt: savedUser.createdAt,
      }
    });

  } catch (error) {
    console.error('❌ Create user error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to create user'
    });
  }
};

/**
 * Get user by ID
 */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        ok: false,
        error: 'User ID is required'
      });
    }

    const user = await User.findById(id).lean();

    if (!user) {
      return res.status(404).json({
        ok: false,
        error: 'User not found'
      });
    }

    res.json({
      ok: true,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        createdAt: user.createdAt,
      }
    });

  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to get user'
    });
  }
};

/**
 * Get user by phone number
 */
export const getUserByPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({
        ok: false,
        error: 'Phone number is required'
      });
    }

    const user = await User.findOne({ phone }).lean();

    if (!user) {
      return res.status(404).json({
        ok: false,
        error: 'User not found'
      });
    }

    res.json({
      ok: true,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        createdAt: user.createdAt,
      }
    });

  } catch (error) {
    console.error('❌ Get user by phone error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to get user'
    });
  }
};