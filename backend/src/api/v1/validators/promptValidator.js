import { body, validationResult } from 'express-validator';

/**
 * Validation result middleware
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Create prompt validation rules
 */
export const createPromptValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('imageUrl')
    .trim()
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Please provide a valid image URL'),
  body('categoryId')
    .trim()
    .notEmpty()
    .withMessage('Category ID is required')
    .isString()
    .withMessage('Category ID must be a string'),
  body('modelId')
    .trim()
    .notEmpty()
    .withMessage('Model ID is required')
    .isString()
    .withMessage('Model ID must be a string'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      return true;
    }),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),
  validate,
];

/**
 * Update prompt validation rules
 */
export const updatePromptValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('imageUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid image URL'),
  body('categoryId')
    .optional()
    .trim()
    .isString()
    .withMessage('Category ID must be a string'),
  body('modelId')
    .optional()
    .trim()
    .isString()
    .withMessage('Model ID must be a string'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      return true;
    }),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),
  validate,
];
