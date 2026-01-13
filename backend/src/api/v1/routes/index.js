import express from 'express';
import authRoutes from './authRoutes.js';
import promptRoutes from './promptRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import discoverRoutes from './discoverRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import modelRoutes from './modelRoutes.js';
import adminRoutes from './adminRoutes.js';
import adminAuthRoutes from './adminAuthRoutes.js';
import voteRoutes from './voteRoutes.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
router.use('/auth', authRoutes);

// Prompt routes
router.use('/prompts', promptRoutes);

// Upload routes
router.use('/upload', uploadRoutes);

// Discover routes
router.use('/discover', discoverRoutes);

// Category routes
router.use('/categories', categoryRoutes);

// Model routes
router.use('/models', modelRoutes);

// Admin auth routes (must be before admin routes)
router.use('/admin/auth', adminAuthRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// Vote routes
router.use('/votes', voteRoutes);

export default router;
