import express from 'express';
import { VoteController } from '../controllers/voteController.js';
import { authenticate } from '../../../middlewares/auth.js';
import {
  voteOnPromptValidator,
  getUserVoteValidator,
} from '../validators/voteValidator.js';

const router = express.Router();

// All vote routes require authentication
router.use(authenticate);

// Vote on a prompt
router.post(
  '/',
  voteOnPromptValidator,
  VoteController.voteOnPrompt
);

// Get user's vote for a prompt
router.get(
  '/:promptId',
  getUserVoteValidator,
  VoteController.getUserVote
);

export default router;
