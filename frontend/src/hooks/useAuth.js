import { useMutation } from '@tanstack/react-query';
import { baseApi } from '@/lib/api';
import { useAuthContext } from '@/contexts/AuthContext';

export function useRegister() {
  const { login } = useAuthContext();
  
  return useMutation({
    mutationFn: (data) => baseApi.post('/auth/register', data),
    onSuccess: (response) => {
      // Store token and user in context and localStorage
      // Axios response structure: response.data = API response
      if (response?.data?.success && response?.data?.data) {
        login(response.data.data.user, response.data.data.token);
      }
    },
  });
}

export function useLogin() {
  const { login } = useAuthContext();
  
  return useMutation({
    mutationFn: (data) => baseApi.post('/auth/login', data),
    onSuccess: (response) => {
      // Store token and user in context and localStorage
      // Axios response structure: response.data = API response
      if (response?.data?.success && response?.data?.data) {
        login(response.data.data.user, response.data.data.token);
      }
    },
  });
}
