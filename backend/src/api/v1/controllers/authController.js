import { AuthService } from '../../../services/authService.js';

export class AuthController {
  /**
   * Signup - Register a new user
   */
  static async signup(req, res) {
    try {
      const { email, password, name } = req.body;

      const result = await AuthService.signup(email, password, name);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  /**
   * Login - Authenticate user
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req, res) {
    try {
      const user = await AuthService.getProfile(req.user.id);

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
}
