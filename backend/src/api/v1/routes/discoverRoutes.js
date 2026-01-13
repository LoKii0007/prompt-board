import express from 'express';
import { DiscoverController } from '../controllers/discoverController.js';
import { optionalAuthenticate } from '../../../middlewares/auth.js';

const router = express.Router();

/**
 * @route   GET /api/v1/discover
 * @desc    Get discover prompts (from users with isPrivate = false)
 * @access  Public (optional auth for vote status)
 */
router.get('/', optionalAuthenticate, DiscoverController.getDiscoverPrompts);

/**
 * @route   GET /api/v1/discover/:id
 * @desc    Get a single discover prompt by ID
 * @access  Public (optional auth for vote status)
 */
router.get('/:id', optionalAuthenticate, DiscoverController.getDiscoverPromptById);

export default router;
