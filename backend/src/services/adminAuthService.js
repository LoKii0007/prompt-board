import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import prisma from '../lib/prisma.js';

export class AdminAuthService {
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
   * Generate JWT token for admin
   */
  static generateToken(adminId) {
    return jwt.sign({ adminId, type: 'admin' }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Register a new admin
   */
  static async signup(email, password, name) {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingAdmin) {
      const error = new Error('Admin with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = this.generateToken(admin.id);

    return {
      admin,
      token,
    };
  }

  /**
   * Login admin
   */
  static async login(email, password) {
    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Compare password
    const isPasswordValid = await this.comparePassword(password, admin.password);

    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Generate token
    const token = this.generateToken(admin.id);

    // Return admin data (excluding password)
    const adminData = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      createdAt: admin.createdAt,
    };

    return {
      admin: adminData,
      token,
    };
  }

  /**
   * Get current admin profile
   */
  static async getProfile(adminId) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      const error = new Error('Admin not found');
      error.statusCode = 404;
      throw error;
    }

    return admin;
  }
}
