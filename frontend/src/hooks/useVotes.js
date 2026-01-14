import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { baseApi } from '@/lib/api';

/**
 * Vote on a prompt (upvote or downvote)
 * @param {number} value - 1 for upvote, -1 for downvote
 */
export function useVoteOnPrompt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ promptId, value }) => {
      // Backend expects 1 for upvote, -1 for downvote
      // If same value is sent again, backend removes the vote
      return baseApi.post('/votes', { promptId, value });
    },
    // No optimistic updates here - handled locally in component with debounce
    // Always refetch after error or success to keep in sync with server
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['discover'] });
      queryClient.invalidateQueries({ queryKey: ['discover-infinite'] });
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
