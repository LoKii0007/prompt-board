import express from 'express';
import { CategoryController } from '../controllers/categoryController.js';

const router = express.Router();

/**
 * @route   GET /api/v1/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', CategoryController.getAllCategories);

/**
 * @route   GET /api/v1/categories/:id
 * @desc    Get a single category by ID
 * @access  Public
 */
router.get('/:id', CategoryController.getCategoryById);

export default router;
