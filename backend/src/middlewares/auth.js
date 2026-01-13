import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import prisma from '../lib/prisma.js';

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        profileImageUrl: true,
        bio: true,
        isDeleted: true,
        isBanned: true,
        isSuspended: true,
        isLocked: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is deleted, banned, or suspended
    if (user.isDeleted || user.isBanned || user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Account is not accessible',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    next(error);
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't fail if no token is provided
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        profileImageUrl: true,
        bio: true,
        isDeleted: true,
        isBanned: true,
        isSuspended: true,
        isLocked: true,
      },
    });

    if (!user || user.isDeleted || user.isBanned || user.isSuspended) {
      // Invalid user, continue without user
      req.user = null;
      return next();
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    // Token invalid or expired, continue without user
    req.user = null;
    next();
  }
};