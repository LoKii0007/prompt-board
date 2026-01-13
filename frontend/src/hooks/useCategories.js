import { useQuery } from '@tanstack/react-query';
import { baseApi } from '@/lib/api';

export function useGetCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await baseApi.get('/categories');
      return response.data;
    },
  });
}

export function useGetCategoryById(id) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: async () => {
      const response = await baseApi.get(`/categories/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
