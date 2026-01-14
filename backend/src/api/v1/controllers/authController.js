import { AuthService } from "../../../services/authService.js";

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
        message: "User registered successfully",
        data: result,
      });
    } catch (error) {
      console.error(error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
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
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      console.error(error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
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
        message: "Profile retrieved successfully",
        data: { user },
      });
    } catch (error) {
      console.error(error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
        error: error.message,
      });
    }
  }

  /**
   * Google OAuth - Login or signup with Google
   */
  static async googleAuth(req, res) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({
          success: false,
          message: "Google ID token is required",
        });
      }

      // Verify Google token
      const { OAuth2Client } = await import("google-auth-library");
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const googleId = payload.sub;
      const email = payload.email;
      const name = payload.name;
      const profileImageUrl = payload.picture;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email not provided by Google",
        });
      }

      // Use Google OAuth service
      const result = await AuthService.googleAuth(
        googleId,
        email,
        name,
        profileImageUrl
      );

      res.status(200).json({
        success: true,
        message: "Google authentication successful",
        data: result,
      });
    } catch (error) {
      console.error("Google auth error:", error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Google authentication failed",
        error: error.message,
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req, res) {
    try {
      const { name, oldPassword, newPassword } = req.body;
      const userId = req.user.id;

      const result = await AuthService.updateProfile(userId, {
        name,
        oldPassword,
        newPassword,
      });

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: result,
      });
    } catch (error) {
      console.error(error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
        error: error.message,
      });
    }
  }
}
