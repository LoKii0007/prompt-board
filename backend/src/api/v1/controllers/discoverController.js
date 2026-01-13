import { DiscoverService } from '../../../services/discoverService.js';

export class DiscoverController {
  /**
   * Get discover prompts (public prompts from users with isPrivate = false)
   */
  static async getDiscoverPrompts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const categoryId = req.query.categoryId || null;
      const modelId = req.query.modelId || null;
      const tag = req.query.tag || null;
      const userId = req.user?.id || null;

      const result = await DiscoverService.getDiscoverPrompts(page, limit, categoryId, modelId, tag, userId);

      res.status(200).json({
        success: true,
        message: 'Discover prompts retrieved successfully',
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
   * Get a single discover prompt by ID
   */
  static async getDiscoverPromptById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || null;
      const prompt = await DiscoverService.getDiscoverPromptById(id, userId);

      res.status(200).json({
        success: true,
        message: 'Discover prompt retrieved successfully',
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
}
