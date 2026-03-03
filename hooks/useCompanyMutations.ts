import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, ensureAuthSession } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';

interface CompanyInput {
  name: string;
  role_title?: string;
  start_date: string | null;
  end_date?: string | null;
  is_current: boolean;
}

export function useCompanyMutations() {
  const queryClient = useQueryClient();
  const userId = useUserStore((s) => s.authUser?.id);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['companies', userId] });
  };

  const createCompany = useMutation({
    mutationFn: async (input: CompanyInput) => {
      const authUserId = await ensureAuthSession();
      const companyId = crypto.randomUUID();

      // If marking as current, only unset is_current on other companies
      // Do NOT auto-set end_date — that's the user's responsibility
      if (input.is_current) {
        await supabase
          .from('companies')
          .update({ is_current: false })
          .eq('user_id', authUserId)
          .eq('is_current', true)
          .is('deleted_at', null);
      }

      const { error } = await supabase.from('companies').insert({
        company_id: companyId,
        user_id: authUserId,
        name: input.name,
        role_title: input.role_title || null,
        start_date: input.start_date,
        end_date: input.end_date || null,
        is_current: input.is_current,
      });

      if (error) throw error;

      // If current, update user's current_company_id
      if (input.is_current) {
        await supabase
          .from('users')
          .update({ current_company_id: companyId })
          .eq('user_id', authUserId);
      }

      return companyId;
    },
    onSuccess: invalidate,
  });

  const updateCompany = useMutation({
    mutationFn: async ({ id, ...input }: CompanyInput & { id: string }) => {
      const authUserId = await ensureAuthSession();

      // If marking as current, only unset is_current on other companies
      // Do NOT auto-set end_date or change start_date on other companies
      if (input.is_current) {
        await supabase
          .from('companies')
          .update({ is_current: false })
          .eq('user_id', authUserId)
          .eq('is_current', true)
          .neq('company_id', id)
          .is('deleted_at', null);
      }

      const { error } = await supabase
        .from('companies')
        .update({
          name: input.name,
          role_title: input.role_title || null,
          start_date: input.start_date,
          end_date: input.end_date || null,
          is_current: input.is_current,
        })
        .eq('company_id', id)
        .eq('user_id', authUserId);

      if (error) throw error;

      // If current, update user's current_company_id
      if (input.is_current) {
        await supabase
          .from('users')
          .update({ current_company_id: id })
          .eq('user_id', authUserId);
      }
    },
    onSuccess: invalidate,
  });

  const deleteCompany = useMutation({
    mutationFn: async (companyId: string) => {
      const authUserId = await ensureAuthSession();

      // Soft delete
      const { error } = await supabase
        .from('companies')
        .update({ deleted_at: new Date().toISOString() })
        .eq('company_id', companyId)
        .eq('user_id', authUserId);

      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { createCompany, updateCompany, deleteCompany };
}
