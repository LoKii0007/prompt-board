import { VoteService } from '../../../services/voteService.js';

export class VoteController {
  /**
   * Vote on a prompt (upvote or downvote)
   * POST /api/v1/votes
   */
  static async voteOnPrompt(req, res, next) {
    try {
      const userId = req.user.id;
      const { promptId, value } = req.body;

      const result = await VoteService.voteOnPrompt(userId, promptId, value);

      res.status(200).json({
        success: true,
        message: `Vote ${result.action} successfully`,
        data: {
          prompt: result.prompt,
          vote: result.vote,
          action: result.action,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's vote for a prompt
   * GET /api/v1/votes/:promptId
   */
  static async getUserVote(req, res, next) {
    try {
      const userId = req.user.id;
      const { promptId } = req.params;

      const vote = await VoteService.getUserVote(userId, promptId);

      res.status(200).json({
        success: true,
        data: {
          vote: vote || null,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
