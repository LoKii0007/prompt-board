import { useMutation, useQueryClient } from '@tanstack/react-query';
import { baseApi } from '@/lib/api';

// Category mutations
export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => baseApi.post('/admin/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => baseApi.put(`/admin/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => baseApi.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// Model mutations
export function useCreateModel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => baseApi.post('/admin/models', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
}

export function useUpdateModel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => baseApi.put(`/admin/models/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
}

export function useDeleteModel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => baseApi.delete(`/admin/models/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
}
