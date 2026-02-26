import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import type { Tag } from '@/types/database';

export function useTags() {
  const userId = useUserStore((s) => s.authUser?.id);

  return useQuery<Tag[]>({
    queryKey: ['tags', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .is('deleted_at', null)
        .or(`is_system.eq.true,user_id.eq.${userId!}`)
        .order('name');

      if (error) throw error;
      return (data ?? []) as Tag[];
    },
  });
}
