import prisma from '../lib/prisma.js';

export class PromptService {
  /**
   * Create a new prompt
   */
  static async createPrompt(userId, data) {
    const { title, description, imageUrl, categoryId, modelId, tags } = data;

    const prompt = await prisma.prompt.create({
      data: {
        title,
        description,
        imageUrl,
        categoryId,
        modelId,
        tags: tags || [],
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            profileImageUrl: true,
          },
        },
        category: true,
        model: true,
      },
    });

    return prompt;
  }

  /**
   * Get all prompts (with pagination)
   */
  static async getAllPrompts(page = 1, limit = 10, categoryId = null) {
    const skip = (page - 1) * limit;
    const where = categoryId ? { categoryId } : {};

    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              profileImageUrl: true,
            },
          },
          category: true,
          model: true,
        },
      }),
      prisma.prompt.count({ where }),
    ]);

    return {
      prompts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }


  /**
   * Get prompts by user ID
   */
  static async getPromptsByUserId(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              profileImageUrl: true,
            },
          },
          category: true,
          model: true,
        },
      }),
      prisma.prompt.count({ where: { userId } }),
    ]);

    return {
      prompts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single prompt by ID
   */
  static async getPromptById(promptId) {
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            profileImageUrl: true,
          },
        },
        category: true,
        model: true,
      },
    });

    if (!prompt) {
      const error = new Error('Prompt not found');
      error.statusCode = 404;
      throw error;
    }

    return prompt;
  }

  /**
   * Update a prompt
   */
  static async updatePrompt(promptId, userId, data) {
    // Check if prompt exists and belongs to user
    const existingPrompt = await prisma.prompt.findUnique({
      where: { id: promptId },
    });

    if (!existingPrompt) {
      const error = new Error('Prompt not found');
      error.statusCode = 404;
      throw error;
    }

    if (existingPrompt.userId !== userId) {
      const error = new Error('Not authorized to update this prompt');
      error.statusCode = 403;
      throw error;
    }

    const { title, description, imageUrl, categoryId, modelId, tags } = data;

    const prompt = await prisma.prompt.update({
      where: { id: promptId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(imageUrl && { imageUrl }),
        ...(categoryId && { categoryId }),
        ...(modelId && { modelId }),
        ...(tags !== undefined && { tags }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            profileImageUrl: true,
          },
        },
        category: true,
        model: true,
      },
    });

    return prompt;
  }

  /**
   * Delete a prompt
   */
  static async deletePrompt(promptId, userId) {
    // Check if prompt exists and belongs to user
    const existingPrompt = await prisma.prompt.findUnique({
      where: { id: promptId },
    });

    if (!existingPrompt) {
      const error = new Error('Prompt not found');
      error.statusCode = 404;
      throw error;
    }

    if (existingPrompt.userId !== userId) {
      const error = new Error('Not authorized to delete this prompt');
      error.statusCode = 403;
      throw error;
    }

    await prisma.prompt.delete({
      where: { id: promptId },
    });

    return { message: 'Prompt deleted successfully' };
  }
}
