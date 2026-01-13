import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import prisma from '../lib/prisma.js';

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
      const error = new Error('User with this email already exists');
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
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Check if user is deleted, banned, or suspended
    if (user.isDeleted || user.isBanned || user.isSuspended) {
      const error = new Error('Account is not accessible');
      error.statusCode = 403;
      throw error;
    }

    // Compare password
    const isPasswordValid = await this.comparePassword(password, user.password);

    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
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
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }
}
