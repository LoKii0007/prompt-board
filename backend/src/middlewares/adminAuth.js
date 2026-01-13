import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import prisma from '../lib/prisma.js';

/**
 * Admin authentication middleware
 * Verifies JWT token and attaches admin to request
 */
export const authenticateAdmin = async (req, res, next) => {
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

    // Check if token is for admin (has type: 'admin' and adminId)
    if (decoded.type !== 'admin' || !decoded.adminId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type. Admin token required',
      });
    }

    // Get admin from database
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found',
      });
    }

    // Attach admin to request
    req.admin = admin;
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
