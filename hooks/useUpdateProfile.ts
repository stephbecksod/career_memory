import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, ensureAuthSession } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';

interface ProfileUpdate {
  first_name?: string;
  last_name?: string;
  default_role_title?: string;
  timezone?: string;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { profile, fetchProfile } = useUserStore();

  return useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      const userId = await ensureAuthSession();

      const { error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (error) throw error;

      // Refresh the profile in the store
      // Force refetch by clearing cached profile first
      useUserStore.setState({ profile: null });
      await fetchProfile(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}
