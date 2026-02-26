import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import type { HighlightItem } from '@/types/app';
import type { ProfessionalAchievement, Project } from '@/types/database';

export function useHighlights() {
  const userId = useUserStore((s) => s.authUser?.id);

  return useQuery<HighlightItem[]>({
    queryKey: ['highlights', userId],
    enabled: !!userId,
    queryFn: async () => {
      const [achievementsRes, projectsRes] = await Promise.all([
        supabase
          .from('professional_achievements')
          .select('*')
          .eq('user_id', userId!)
          .eq('is_highlight', true)
          .is('deleted_at', null)
          .order('created_at', { ascending: false }),
        supabase
          .from('projects')
          .select('*')
          .eq('user_id', userId!)
          .eq('is_highlight', true)
          .is('deleted_at', null)
          .order('created_at', { ascending: false }),
      ]);

      const items: HighlightItem[] = [];

      for (const a of (achievementsRes.data ?? []) as ProfessionalAchievement[]) {
        items.push({
          id: a.achievement_id,
          name: a.ai_generated_name ?? `${a.created_at.slice(0, 10)} achievement`,
          type: 'achievement',
          item: a,
        });
      }

      for (const p of (projectsRes.data ?? []) as Project[]) {
        items.push({
          id: p.project_id,
          name: p.name,
          type: 'project',
          item: p,
        });
      }

      return items;
    },
  });
}
