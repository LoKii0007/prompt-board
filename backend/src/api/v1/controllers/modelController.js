import { ModelService } from '../../../services/modelService.js';

export class ModelController {
  /**
   * Get all models
   */
  static async getAllModels(req, res) {
    try {
      const models = await ModelService.getAllModels();

      res.status(200).json({
        success: true,
        message: 'Models retrieved successfully',
        data: { models },
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
   * Get a single model by ID
   */
  static async getModelById(req, res) {
    try {
      const { id } = req.params;
      const model = await ModelService.getModelById(id);

      res.status(200).json({
        success: true,
        message: 'Model retrieved successfully',
        data: { model },
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
