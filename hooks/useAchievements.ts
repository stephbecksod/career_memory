import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import type { ProfessionalAchievement, AchievementTag, Tag } from '@/types/database';

export interface AchievementWithTags extends ProfessionalAchievement {
  achievement_tags: (AchievementTag & { tag: Tag })[];
}

interface UseAchievementsOptions {
  entryId?: string;
  projectId?: string;
}

export function useAchievements(options?: UseAchievementsOptions) {
  const userId = useUserStore((s) => s.authUser?.id);

  return useQuery<AchievementWithTags[]>({
    queryKey: ['achievements', userId, options?.entryId, options?.projectId],
    enabled: !!userId,
    queryFn: async () => {
      let query = supabase
        .from('professional_achievements')
        .select('*, achievement_tags(*, tag:tags(*))')
        .eq('user_id', userId!)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (options?.entryId) {
        query = query.eq('entry_id', options.entryId);
      }
      if (options?.projectId) {
        query = query.eq('project_id', options.projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as AchievementWithTags[];
    },
  });
}
