import { CategoryService } from '../../../services/categoryService.js';
import { ModelService } from '../../../services/modelService.js';

export class AdminController {
  // Category CRUD
  static async createCategory(req, res) {
    try {
      const result = await CategoryService.createCategory(req.body);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { category: result },
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

  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await CategoryService.updateCategory(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: { category: result },
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

  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      await CategoryService.deleteCategory(id);

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
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

  // Model CRUD
  static async createModel(req, res) {
    try {
      const result = await ModelService.createModel(req.body);

      res.status(201).json({
        success: true,
        message: 'Model created successfully',
        data: { model: result },
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

  static async updateModel(req, res) {
    try {
      const { id } = req.params;
      const result = await ModelService.updateModel(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Model updated successfully',
        data: { model: result },
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

  static async deleteModel(req, res) {
    try {
      const { id } = req.params;
      await ModelService.deleteModel(id);

      res.status(200).json({
        success: true,
        message: 'Model deleted successfully',
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
