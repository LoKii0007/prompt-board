import { PromptService } from '../../../services/promptService.js';

export class PromptController {
  /**
   * Create a new prompt
   */
  static async createPrompt(req, res) {
    try {
      const userId = req.user.id;
      const result = await PromptService.createPrompt(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Prompt created successfully',
        data: { prompt: result },
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
   * Get all prompts
   */
  static async getAllPrompts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const categoryId = req.query.categoryId || null;

      const result = await PromptService.getAllPrompts(page, limit, categoryId);

      res.status(200).json({
        success: true,
        message: 'Prompts retrieved successfully',
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
   * Get prompts by current user
   */
  static async getMyPrompts(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await PromptService.getPromptsByUserId(userId, page, limit);

      res.status(200).json({
        success: true,
        message: 'Prompts retrieved successfully',
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
   * Get a single prompt by ID
   */
  static async getPromptById(req, res) {
    try {
      const { id } = req.params;
      const prompt = await PromptService.getPromptById(id);

      res.status(200).json({
        success: true,
        message: 'Prompt retrieved successfully',
        data: { prompt },
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
   * Update a prompt
   */
  static async updatePrompt(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const result = await PromptService.updatePrompt(id, userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Prompt updated successfully',
        data: { prompt: result },
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
   * Delete a prompt
   */
  static async deletePrompt(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      await PromptService.deletePrompt(id, userId);

      res.status(200).json({
        success: true,
        message: 'Prompt deleted successfully',
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
