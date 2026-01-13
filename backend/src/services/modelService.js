import prisma from '../lib/prisma.js';

export class ModelService {
  /**
   * Get all models
   */
  static async getAllModels() {
    const models = await prisma.modelNames.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return models;
  }

  /**
   * Get a single model by ID
   */
  static async getModelById(modelId) {
    const model = await prisma.modelNames.findUnique({
      where: { id: modelId },
      include: {
        _count: {
          select: {
            prompts: true,
          },
        },
      },
    });

    if (!model) {
      const error = new Error('Model not found');
      error.statusCode = 404;
      throw error;
    }

    return model;
  }

  /**
   * Create a new model (admin only - can be added later)
   */
  static async createModel(data) {
    const { name, description } = data;

    // Check if model already exists
    const existingModel = await prisma.modelNames.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existingModel) {
      const error = new Error('Model with this name already exists');
      error.statusCode = 409;
      throw error;
    }

    const model = await prisma.modelNames.create({
      data: {
        name,
        description,
      },
    });

    return model;
  }

  /**
   * Update a model
   */
  static async updateModel(modelId, data) {
    const { name, description } = data;

    // Check if model exists
    const existingModel = await prisma.modelNames.findUnique({
      where: { id: modelId },
    });

    if (!existingModel) {
      const error = new Error('Model not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if name is being changed and if new name already exists
    if (name && name !== existingModel.name) {
      const duplicateModel = await prisma.modelNames.findFirst({
        where: {
          name: { equals: name, mode: 'insensitive' },
          id: { not: modelId },
        },
      });

      if (duplicateModel) {
        const error = new Error('Model with this name already exists');
        error.statusCode = 409;
        throw error;
      }
    }

    const model = await prisma.modelNames.update({
      where: { id: modelId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    return model;
  }

  /**
   * Delete a model
   */
  static async deleteModel(modelId) {
    // Check if model exists
    const model = await prisma.modelNames.findUnique({
      where: { id: modelId },
      include: {
        _count: {
          select: {
            prompts: true,
          },
        },
      },
    });

    if (!model) {
      const error = new Error('Model not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if model has prompts
    if (model._count.prompts > 0) {
      const error = new Error('Cannot delete model with associated prompts');
      error.statusCode = 400;
      throw error;
    }

    await prisma.modelNames.delete({
      where: { id: modelId },
    });

    return { message: 'Model deleted successfully' };
  }
}
