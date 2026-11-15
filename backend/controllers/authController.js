/**
 * Authentication Controller
 * Registration, Login, Profile updates, and Password management.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'ai_analyzer_super_secret_jwt_key_2026_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
        errors: ['Email already registered']
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    const token = signToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user,
        token
      }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        errors: ['Invalid credentials']
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        errors: ['Invalid credentials']
      });
    }

    const token = signToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function getMe(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully.',
      data: {
        user: req.user
      }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
    data: {}
  });
}

// PUT /api/profile
async function updateProfile(req, res, next) {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    if (email && email.toLowerCase() !== req.user.email.toLowerCase()) {
      const existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another account.',
          errors: ['Email conflict']
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || req.user.name,
        email: email ? email.toLowerCase() : req.user.email
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: updatedUser }
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/profile/password
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
        errors: ['Password too short']
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.',
        errors: ['Incorrect current password']
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
      data: {}
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  changePassword
};

