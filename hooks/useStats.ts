import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';

interface Stats {
  entries: number;
  achievements: number;
  projects: number;
}

export function useStats() {
  const userId = useUserStore((s) => s.authUser?.id);

  return useQuery<Stats>({
    queryKey: ['stats', userId],
    enabled: !!userId,
    queryFn: async () => {
      const [entriesRes, achievementsRes, projectsRes] = await Promise.all([
        supabase
          .from('entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId!)
          .is('deleted_at', null),
        supabase
          .from('professional_achievements')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId!)
          .is('deleted_at', null),
        supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId!)
          .is('deleted_at', null),
      ]);

      return {
        entries: entriesRes.count ?? 0,
        achievements: achievementsRes.count ?? 0,
        projects: projectsRes.count ?? 0,
      };
    },
  });
}
