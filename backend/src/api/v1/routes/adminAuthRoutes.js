import express from 'express';
import { AdminAuthController } from '../controllers/adminAuthController.js';
import { authenticateAdmin } from '../../../middlewares/adminAuth.js';
import {
  adminSignupValidation,
  adminLoginValidation,
} from '../validators/adminAuthValidator.js';

const router = express.Router();

/**
 * @route   POST /api/v1/admin/auth/signup
 * @desc    Register a new admin
 * @access  Public (should be restricted in production)
 */
// router.post('/signup', adminSignupValidation, AdminAuthController.signup);

/**
 * @route   POST /api/v1/admin/auth/login
 * @desc    Login admin
 * @access  Public
 */
router.post('/login', adminLoginValidation, AdminAuthController.login);

/**
 * @route   GET /api/v1/admin/auth/profile
 * @desc    Get current admin profile
 * @access  Private (Admin only)
 */
router.get('/profile', authenticateAdmin, AdminAuthController.getProfile);

export default router;
