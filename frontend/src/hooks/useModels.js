import { useQuery } from '@tanstack/react-query';
import { baseApi } from '@/lib/api';

export function useGetModels() {
  return useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const response = await baseApi.get('/models');
      return response.data;
    },
  });
}

export function useGetModelById(id) {
  return useQuery({
    queryKey: ['models', id],
    queryFn: async () => {
      const response = await baseApi.get(`/models/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
