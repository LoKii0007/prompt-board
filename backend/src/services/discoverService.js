import prisma from '../lib/prisma.js';
import { VoteService } from './voteService.js';

export class DiscoverService {
  /**
   * Get discover prompts (from users with isPrivate = false)
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string|null} categoryId - Category filter
   * @param {string|null} modelId - Model filter
   * @param {string|null} tag - Tag filter
   * @param {string|null} userId - Optional user ID to include vote status
   */
  static async getDiscoverPrompts(page = 1, limit = 10, categoryId = null, modelId = null, tag = null, userId = null) {
    const skip = (page - 1) * limit;
    
    // Build where clause: user must have isPrivate = false
    const where = {
      user: {
        isPrivate: false,
        isDeleted: false,
        isBanned: false,
        isSuspended: false,
      },
    };

    // Add category filter if provided
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Add model filter if provided
    if (modelId) {
      where.modelId = modelId;
    }

    // Add tag filter if provided (searches in tags array)
    if (tag) {
      where.tags = {
        has: tag,
      };
    }

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

    // If userId is provided, fetch user votes for all prompts
    let userVotes = [];
    if (userId && prompts.length > 0) {
      const promptIds = prompts.map(p => p.id);
      userVotes = await VoteService.getUserVotesForPrompts(userId, promptIds);
    }

    // Map votes to prompts
    const promptsWithVotes = prompts.map(prompt => {
      const vote = userVotes.find(v => v.promptId === prompt.id);
      return {
        ...prompt,
        userVote: vote ? vote.value : null,
      };
    });

    return {
      prompts: promptsWithVotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single discover prompt by ID (only if user is public)
   * @param {string} promptId - Prompt ID
   * @param {string|null} userId - Optional user ID to include vote status
   */
  static async getDiscoverPromptById(promptId, userId = null) {
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            profileImageUrl: true,
            isPrivate: true,
            isDeleted: true,
            isBanned: true,
            isSuspended: true,
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

    // Check if user is public
    if (prompt.user.isPrivate || prompt.user.isDeleted || prompt.user.isBanned || prompt.user.isSuspended) {
      const error = new Error('Prompt not available');
      error.statusCode = 403;
      throw error;
    }

    // Remove sensitive user fields from response
    const { isPrivate, isDeleted, isBanned, isSuspended, ...userData } = prompt.user;
    prompt.user = userData;

    // Get user's vote if userId is provided
    let userVote = null;
    if (userId) {
      const vote = await VoteService.getUserVote(userId, promptId);
      userVote = vote ? vote.value : null;
    }

    return {
      ...prompt,
      userVote,
    };
  }
}
