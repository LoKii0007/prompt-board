import express from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticateAdmin } from '../../../middlewares/adminAuth.js';
import {
  categoryValidation,
  categoryUpdateValidation,
  modelValidation,
  modelUpdateValidation,
} from '../validators/adminValidator.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(authenticateAdmin);

// Category CRUD routes
router.post('/categories', categoryValidation, AdminController.createCategory);
router.put('/categories/:id', categoryUpdateValidation, AdminController.updateCategory);
router.delete('/categories/:id', AdminController.deleteCategory);

// Model CRUD routes
router.post('/models', modelValidation, AdminController.createModel);
router.put('/models/:id', modelUpdateValidation, AdminController.updateModel);
router.delete('/models/:id', AdminController.deleteModel);

export default router;
