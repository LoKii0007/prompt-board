import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseApi } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthContext();

  return useMutation({
    mutationFn: (data) => baseApi.put("/auth/me", data),
    onSuccess: async (response) => {
      // Invalidate queries that might depend on user data
      await queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      // Update local auth context
      if (response?.data?.data) {
        updateUser(response.data.data);
      }
    },
  });
}
