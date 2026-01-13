import { CategoryService } from '../../../services/categoryService.js';

export class CategoryController {
  /**
   * Get all categories
   */
  static async getAllCategories(req, res) {
    try {
      const categories = await CategoryService.getAllCategories();

      res.status(200).json({
        success: true,
        message: 'Categories retrieved successfully',
        data: { categories },
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
   * Get a single category by ID
   */
  static async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const category = await CategoryService.getCategoryById(id);

      res.status(200).json({
        success: true,
        message: 'Category retrieved successfully',
        data: { category },
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
