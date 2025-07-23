import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useGameStats() {
  return useQuery({
    queryKey: ["gameStats"],
    queryFn: () => api.getGameStats(),
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["recentActivity"],
    queryFn: () => api.getRecentActivity(),
  });
}

export function useUserProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => api.getUserProfile(),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateProfile: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}

export function useUserMusic() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["userMusic"],
    queryFn: () => api.getUserMusic(),
  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => api.uploadMusic(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userMusic"] });
    },
  });

  return {
    music: query.data,
    isLoading: query.isLoading,
    error: query.error,
    uploadMusic: mutation.mutate,
    isUploading: mutation.isPending,
  };
}

export function useGameHistory(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["gameHistory", page, limit],
    queryFn: () => api.getGameHistory(page, limit),
    placeholderData: (previousData) => previousData,
  });
}
