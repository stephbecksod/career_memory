import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, ensureAuthSession } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import type { UserPreference } from '@/types/database';

type PreferenceMap = Record<string, string>;

export function usePreferences() {
  const userId = useUserStore((s) => s.authUser?.id);
  const queryClient = useQueryClient();

  const query = useQuery<PreferenceMap>({
    queryKey: ['preferences', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId!)
        .order('preference_key');

      if (error) throw error;

      const map: PreferenceMap = {};
      for (const row of (data ?? []) as UserPreference[]) {
        map[row.preference_key] = row.preference_value;
      }
      return map;
    },
  });

  const setPreference = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const authUserId = await ensureAuthSession();

      // Upsert: try update first, then insert if not found
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('preference_id')
        .eq('user_id', authUserId)
        .eq('preference_key', key)
        .limit(1);

      if (existing && existing.length > 0) {
        const { error } = await supabase
          .from('user_preferences')
          .update({ preference_value: value, updated_at: new Date().toISOString() })
          .eq('preference_id', existing[0].preference_id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_preferences').insert({
          user_id: authUserId,
          preference_key: key,
          preference_value: value,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences', userId] });
    },
  });

  return { ...query, setPreference };
}
