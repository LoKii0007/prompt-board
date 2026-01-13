import express from 'express';
import { ModelController } from '../controllers/modelController.js';

const router = express.Router();

/**
 * @route   GET /api/v1/models
 * @desc    Get all models
 * @access  Public
 */
router.get('/', ModelController.getAllModels);

/**
 * @route   GET /api/v1/models/:id
 * @desc    Get a single model by ID
 * @access  Public
 */
router.get('/:id', ModelController.getModelById);

export default router;
