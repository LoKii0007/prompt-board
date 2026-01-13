import { AdminAuthService } from '../../../services/adminAuthService.js';

export class AdminAuthController {
  /**
   * Signup - Register a new admin
   */
  static async signup(req, res) {
    try {
      const { email, password, name } = req.body;

      const result = await AdminAuthService.signup(email, password, name);

      res.status(201).json({
        success: true,
        message: 'Admin registered successfully',
        data: result,
      });
    } catch (error) {
      console.error(error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Internal server error',
        error: error.message,
      });
    }
  }

  /**
   * Login - Authenticate admin
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await AdminAuthService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Admin login successful',
        data: result,
      });
    } catch (error) {
      console.error(error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Internal server error',
        error: error.message,
      });
    }
  }

  /**
   * Get current admin profile
   */
  static async getProfile(req, res) {
    try {
      const admin = await AdminAuthService.getProfile(req.admin.id);

      res.status(200).json({
        success: true,
        message: 'Admin profile retrieved successfully',
        data: { admin },
      });
    } catch (error) {
      console.error(error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Internal server error',
        error: error.message,
      });
    }
  }
}
