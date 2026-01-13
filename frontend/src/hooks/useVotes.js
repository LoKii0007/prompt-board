import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { baseApi } from '@/lib/api';

/**
 * Vote on a prompt (upvote or downvote)
 * @param {number} value - 1 for upvote, -1 for downvote
 */
export function useVoteOnPrompt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ promptId, value }) => 
      baseApi.post('/votes', { promptId, value }),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['discover'] });
      queryClient.invalidateQueries({ queryKey: ['discover', variables.promptId] });
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['votes', variables.promptId] });
    },
  });
}

/**
 * Get user's vote for a prompt
 */
export function useGetUserVote(promptId) {
  return useQuery({
    queryKey: ['votes', promptId],
    queryFn: async () => {
      const response = await baseApi.get(`/votes/${promptId}`);
      return response.data;
    },
    enabled: !!promptId,
  });
}
