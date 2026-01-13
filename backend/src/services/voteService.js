import prisma from '../lib/prisma.js';

export class VoteService {
  /**
   * Vote on a prompt (upvote or downvote)
   * value: 1 for upvote, -1 for downvote
   */
  static async voteOnPrompt(userId, promptId, value) {
    // Validate value
    if (value !== 1 && value !== -1) {
      const error = new Error('Invalid vote value. Must be 1 (upvote) or -1 (downvote)');
      error.statusCode = 400;
      throw error;
    }

    // Check if prompt exists
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
    });

    if (!prompt) {
      const error = new Error('Prompt not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_promptId: {
          userId,
          promptId,
        },
      },
    });

    let updatedPrompt;
    let vote;

    if (existingVote) {
      // User already voted
      if (existingVote.value === value) {
        // Same vote - remove the vote
        await prisma.$transaction(async (tx) => {
          // Delete the vote
          await tx.vote.delete({
            where: {
              userId_promptId: {
                userId,
                promptId,
              },
            },
          });

          // Update prompt counters
          const updateData = {};
          if (value === 1) {
            updateData.upVotes = { decrement: 1 };
          } else {
            updateData.downVotes = { decrement: 1 };
          }

          updatedPrompt = await tx.prompt.update({
            where: { id: promptId },
            data: updateData,
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
        });

        vote = null; // Vote removed
      } else {
        // Different vote - update the vote
        await prisma.$transaction(async (tx) => {
          // Update the vote
          vote = await tx.vote.update({
            where: {
              userId_promptId: {
                userId,
                promptId,
              },
            },
            data: { value },
          });

          // Update prompt counters
          const updateData = {};
          if (existingVote.value === 1) {
            // Was upvote, now downvote
            updateData.upVotes = { decrement: 1 };
            updateData.downVotes = { increment: 1 };
          } else {
            // Was downvote, now upvote
            updateData.downVotes = { decrement: 1 };
            updateData.upVotes = { increment: 1 };
          }

          updatedPrompt = await tx.prompt.update({
            where: { id: promptId },
            data: updateData,
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
        });
      }
    } else {
      // New vote
      await prisma.$transaction(async (tx) => {
        // Create the vote
        vote = await tx.vote.create({
          data: {
            userId,
            promptId,
            value,
          },
        });

        // Update prompt counters
        const updateData = {};
        if (value === 1) {
          updateData.upVotes = { increment: 1 };
        } else {
          updateData.downVotes = { increment: 1 };
        }

        updatedPrompt = await tx.prompt.update({
          where: { id: promptId },
          data: updateData,
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
      });
    }

    return {
      prompt: updatedPrompt,
      vote,
      action: existingVote
        ? existingVote.value === value
          ? 'removed'
          : 'changed'
        : 'created',
    };
  }

  /**
   * Get user's vote for a prompt
   */
  static async getUserVote(userId, promptId) {
    const vote = await prisma.vote.findUnique({
      where: {
        userId_promptId: {
          userId,
          promptId,
        },
      },
    });

    return vote;
  }

  /**
   * Get votes for multiple prompts by a user
   */
  static async getUserVotesForPrompts(userId, promptIds) {
    if (!promptIds || promptIds.length === 0) {
      return [];
    }

    const votes = await prisma.vote.findMany({
      where: {
        userId,
        promptId: {
          in: promptIds,
        },
      },
    });

    return votes;
  }
}
