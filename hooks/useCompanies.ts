import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import type { Company } from '@/types/database';

export function useCompanies() {
  const userId = useUserStore((s) => s.authUser?.id);

  const query = useQuery<Company[]>({
    queryKey: ['companies', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', userId!)
        .is('deleted_at', null)
        .order('is_current', { ascending: false })
        .order('start_date', { ascending: false });

      if (error) throw error;
      return (data ?? []) as Company[];
    },
  });

  const currentCompany = query.data?.find((c) => c.is_current) ?? null;

  return { ...query, currentCompany };
}
