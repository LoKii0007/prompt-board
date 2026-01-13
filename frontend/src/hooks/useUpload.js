import { useMutation } from '@tanstack/react-query';
import { baseApi } from '@/lib/api';

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('image', file);

      const response = await baseApi.post('/upload/image', formData);

      return response.data;
    },
  });
}
