import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import type { Entry } from '@/types/database';

export function useEntries() {
  const userId = useUserStore((s) => s.authUser?.id);

  return useQuery<Entry[]>({
    queryKey: ['entries', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', userId!)
        .is('deleted_at', null)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return (data ?? []) as Entry[];
    },
  });
}
