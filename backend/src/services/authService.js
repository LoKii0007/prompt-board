import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import prisma from "../lib/prisma.js";

export class AuthService {
  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   */
  static generateToken(userId) {
    return jwt.sign({ userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Register a new user
   */
  static async signup(email, password, name = null) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      const error = new Error("User with this email already exists");
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = this.generateToken(user.id);

    return {
      user,
      token,
    };
  }

  /**
   * Login user
   */
  static async login(email, password) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    // Check if user is deleted, banned, or suspended
    if (user.isDeleted || user.isBanned || user.isSuspended) {
      const error = new Error("Account is not accessible");
      error.statusCode = 403;
      throw error;
    }

    // Compare password
    const isPasswordValid = await this.comparePassword(password, user.password);

    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    // Generate token
    const token = this.generateToken(user.id);

    // Return user data (excluding password)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      profileImageUrl: user.profileImageUrl,
      bio: user.bio,
      createdAt: user.createdAt,
    };

    return {
      user: userData,
      token,
    };
  }

  /**
   * Get current user profile
   */
  static async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        profileImageUrl: true,
        bio: true,
        followers: true,
        following: true,
        isVerified: true,
        isPrivate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Login or signup with Google OAuth
   * Uses Google unique ID (sub) as password
   */
  static async googleAuth(googleId, email, name, profileImageUrl = null) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // User exists, verify the Google ID matches (stored as hashed password)
      const isGoogleIdValid = await this.comparePassword(
        googleId,
        existingUser.password
      );

      if (!isGoogleIdValid) {
        // For security, use the same generic message as password login
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
      }

      // Check if user is deleted, banned, or suspended
      if (
        existingUser.isDeleted ||
        existingUser.isBanned ||
        existingUser.isSuspended
      ) {
        const error = new Error("Account is not accessible");
        error.statusCode = 403;
        throw error;
      }

      // Update profile image if provided and different
      if (profileImageUrl && existingUser.profileImageUrl !== profileImageUrl) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { profileImageUrl },
        });
      }

      // Generate token
      const token = this.generateToken(existingUser.id);

      // Return user data
      const userData = {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        profileImageUrl: profileImageUrl || existingUser.profileImageUrl,
        bio: existingUser.bio,
        createdAt: existingUser.createdAt,
      };

      return {
        user: userData,
        token,
      };
    } else {
      // New user, create account with Google ID as password
      const hashedGoogleId = await this.hashPassword(googleId);

      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedGoogleId,
          name: name || null,
          profileImageUrl: profileImageUrl || null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          profileImageUrl: true,
        },
      });

      // Generate token
      const token = this.generateToken(user.id);

      return {
        user,
        token,
      };
    }
  }
  /**
   * Update user profile (name, password)
   */
  static async updateProfile(userId, { name, oldPassword, newPassword }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const updateData = {};

    if (name) {
      updateData.name = name;
    }

    if (newPassword) {
      if (!oldPassword) {
        const error = new Error(
          "Current password is required to change password"
        );
        error.statusCode = 400;
        throw error;
      }

      const isPasswordValid = await this.comparePassword(
        oldPassword,
        user.password
      );
      if (!isPasswordValid) {
        const error = new Error("Invalid current password");
        error.statusCode = 401;
        throw error;
      }

      updateData.password = await this.hashPassword(newPassword);
    }

    if (Object.keys(updateData).length === 0) {
      return user;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        profileImageUrl: true,
        bio: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }
}
