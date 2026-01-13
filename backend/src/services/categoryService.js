import prisma from '../lib/prisma.js';

export class CategoryService {
  /**
   * Get all categories
   */
  static async getAllCategories() {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  }

  /**
   * Get a single category by ID
   */
  static async getCategoryById(categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            prompts: true,
          },
        },
      },
    });

    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    return category;
  }

  /**
   * Create a new category (admin only - can be added later)
   */
  static async createCategory(data) {
    const { name, description } = data;

    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existingCategory) {
      const error = new Error('Category with this name already exists');
      error.statusCode = 409;
      throw error;
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    return category;
  }

  /**
   * Update a category
   */
  static async updateCategory(categoryId, data) {
    const { name, description } = data;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if name is being changed and if new name already exists
    if (name && name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          name: { equals: name, mode: 'insensitive' },
          id: { not: categoryId },
        },
      });

      if (duplicateCategory) {
        const error = new Error('Category with this name already exists');
        error.statusCode = 409;
        throw error;
      }
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    return category;
  }

  /**
   * Delete a category
   */
  static async deleteCategory(categoryId) {
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            prompts: true,
          },
        },
      },
    });

    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if category has prompts
    if (category._count.prompts > 0) {
      const error = new Error('Cannot delete category with associated prompts');
      error.statusCode = 400;
      throw error;
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return { message: 'Category deleted successfully' };
  }
}
