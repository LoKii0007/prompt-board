import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

export class UploadService {
  /**
   * Convert buffer to stream for Cloudinary
   */
  static bufferToStream(buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

  /**
   * Upload file to Cloudinary
   */
  static async uploadToCloudinary(file) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'prompt-board',
          resource_type: 'auto',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          transformation: [
            {
              quality: 'auto',
              fetch_format: 'auto',
            },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      const stream = this.bufferToStream(file.buffer);
      stream.pipe(uploadStream);
    });
  }

  /**
   * Delete file from Cloudinary
   */
  static async deleteFromCloudinary(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }
}
