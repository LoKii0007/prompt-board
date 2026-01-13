import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { baseApi } from '@/lib/api';

export function useCreatePrompt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => baseApi.post('/prompts', data),
    onSuccess: () => {
      // Invalidate prompts queries to refetch
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}

export function useGetPrompts(page = 1, limit = 10, category = null) {
  return useQuery({
    queryKey: ['prompts', page, limit, category],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit });
      if (category) params.append('category', category);
      const response = await baseApi.get(`/prompts?${params.toString()}`);
      return response.data;
    },
  });
}

export function useGetDiscoverPrompts(page = 1, limit = 10, categoryId = null, modelId = null, tag = null) {
  return useQuery({
    queryKey: ['discover', page, limit, categoryId, modelId, tag],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit });
      if (categoryId) params.append('categoryId', categoryId);
      if (modelId) params.append('modelId', modelId);
      if (tag) params.append('tag', tag);
      const response = await baseApi.get(`/discover?${params.toString()}`);
      return response.data;
    },
  });
}

export function useGetDiscoverPromptById(id) {
  return useQuery({
    queryKey: ['discover', id],
    queryFn: async () => {
      const response = await baseApi.get(`/discover/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useGetMyPrompts(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['prompts', 'my', page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit });
      const response = await baseApi.get(`/prompts/my?${params.toString()}`);
      return response.data;
    },
  });
}

export function useGetPromptById(id) {
  return useQuery({
    queryKey: ['prompts', id],
    queryFn: async () => {
      const response = await baseApi.get(`/prompts/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useUpdatePrompt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => baseApi.put(`/prompts/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['prompts', variables.id] });
    },
  });
}

export function useDeletePrompt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => baseApi.delete(`/prompts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}
