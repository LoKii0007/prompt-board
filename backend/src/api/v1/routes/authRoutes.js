import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { signupValidation, loginValidation } from '../validators/authValidator.js';
import { authenticate } from '../../../middlewares/auth.js';

const router = express.Router();

/**
 * @route   POST /api/v1/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', signupValidation, AuthController.signup);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, AuthController.login);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, AuthController.getProfile);

export default router;
