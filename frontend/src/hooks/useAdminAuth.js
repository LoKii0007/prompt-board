import { useMutation } from '@tanstack/react-query';
import { baseApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export function useAdminLogin() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: (data) => baseApi.post('/admin/auth/login', data),
    onSuccess: (response) => {
      // Store admin token and admin data in localStorage
      if (response?.data?.success && response?.data?.data) {
        localStorage.setItem('adminToken', response.data.data.token);
        localStorage.setItem('admin', JSON.stringify(response.data.data.admin));
        // Redirect to admin dashboard/CMS
        router.push('/admin/cms');
      }
    },
  });
}
