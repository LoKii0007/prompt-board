import cloudinary from '../../../config/cloudinary.js';
import { UploadService } from '../../../services/uploadService.js';

export class UploadController {
  /**
   * Upload a single image
   */
  static async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      console.log('Starting image upload to Cloudinary...');
      const startTime = Date.now();
      
      const result = await UploadService.uploadToCloudinary(req.file);
      
      const uploadTime = Date.now() - startTime;
      console.log(`Image uploaded successfully in ${uploadTime}ms`);

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload image',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Upload multiple images
   */
  static async uploadImages(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded',
        });
      }

      const uploadPromises = req.files.map((file) =>
        UploadService.uploadToCloudinary(file)
      );

      const results = await Promise.all(uploadPromises);

      const uploads = results.map((result) => ({
        url: result.secure_url,
        publicId: result.public_id,
      }));

      res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        data: { uploads },
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload images',
        error: error.message,
      });
    }
  }

  /**
   * Delete an image from Cloudinary
   */
  static async deleteImage(req, res) {
    try {
      const { publicId } = req.body;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: 'Public ID is required',
        });
      }

      await UploadService.deleteFromCloudinary(publicId);

      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
      });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete image',
        error: error.message,
      });
    }
  }
}
