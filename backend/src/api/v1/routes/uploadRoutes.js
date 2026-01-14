import express from 'express';
import { UploadController } from '../controllers/uploadController.js';
import { authenticate } from '../../../middlewares/auth.js';
import { uploadSingle, uploadMultiple, handleMulterError } from '../../../middlewares/upload.js';

const router = express.Router();

/**
 * @route   POST /api/v1/upload/image
 * @desc    Upload a single image
 * @access  Private
 */
router.post(
  '/image',
  authenticate,
  uploadSingle,
  handleMulterError,
  UploadController.uploadImage
);

/**
 * @route   POST /api/v1/upload/images
 * @desc    Upload multiple images
 * @access  Private
 */
router.post(
  '/images',
  authenticate,
  uploadMultiple,
  handleMulterError,
  UploadController.uploadImages
);

/**
 * @route   DELETE /api/v1/upload/image
 * @desc    Delete an image from Cloudinary
 * @access  Private
 */
router.delete(
  '/image',
  authenticate,
  UploadController.deleteImage
);

export default router;
