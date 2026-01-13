import express from 'express';
import { PromptController } from '../controllers/promptController.js';
import { createPromptValidation, updatePromptValidation } from '../validators/promptValidator.js';
import { authenticate } from '../../../middlewares/auth.js';

const router = express.Router();

/**
 * @route   POST /api/v1/prompts
 * @desc    Create a new prompt
 * @access  Private
 */
router.post('/', authenticate, createPromptValidation, PromptController.createPrompt);

/**
 * @route   GET /api/v1/prompts
 * @desc    Get all prompts (with optional category filter)
 * @access  Public
 */
router.get('/', PromptController.getAllPrompts);

/**
 * @route   GET /api/v1/prompts/my
 * @desc    Get current user's prompts
 * @access  Private
 */
router.get('/my', authenticate, PromptController.getMyPrompts);

/**
 * @route   GET /api/v1/prompts/:id
 * @desc    Get a single prompt by ID
 * @access  Public
 */
router.get('/:id', PromptController.getPromptById);

/**
 * @route   PUT /api/v1/prompts/:id
 * @desc    Update a prompt
 * @access  Private
 */
router.put('/:id', authenticate, updatePromptValidation, PromptController.updatePrompt);

/**
 * @route   DELETE /api/v1/prompts/:id
 * @desc    Delete a prompt
 * @access  Private
 */
router.delete('/:id', authenticate, PromptController.deletePrompt);

export default router;
