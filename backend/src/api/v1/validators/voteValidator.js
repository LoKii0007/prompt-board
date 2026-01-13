import { body, param, validationResult } from 'express-validator';

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

export const voteOnPromptValidator = [
  body('promptId')
    .trim()
    .notEmpty()
    .withMessage('Prompt ID is required')
    .isString()
    .withMessage('Prompt ID must be a string'),
  body('value')
    .notEmpty()
    .withMessage('Vote value is required')
    .isInt({ min: -1, max: 1 })
    .withMessage('Vote value must be 1 (upvote) or -1 (downvote)'),
  validate,
];

export const getUserVoteValidator = [
  param('promptId')
    .trim()
    .notEmpty()
    .withMessage('Prompt ID is required')
    .isString()
    .withMessage('Prompt ID must be a string'),
  validate,
];
