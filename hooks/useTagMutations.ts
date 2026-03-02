import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, ensureAuthSession } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';

function normalizeSlug(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '_');
}

export function useTagMutations() {
  const queryClient = useQueryClient();
  const userId = useUserStore((s) => s.authUser?.id);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['tags', userId] });
  };

  const createTag = useMutation({
    mutationFn: async (name: string) => {
      const authUserId = await ensureAuthSession();
      const slug = normalizeSlug(name);

      // Check for duplicate slug
      const { data: existing } = await supabase
        .from('tags')
        .select('tag_id')
        .eq('slug', slug)
        .is('deleted_at', null)
        .or(`is_system.eq.true,user_id.eq.${authUserId}`)
        .limit(1);

      if (existing && existing.length > 0) {
        throw new Error('A tag with this name already exists.');
      }

      const { error } = await supabase.from('tags').insert({
        user_id: authUserId,
        name: name.trim(),
        slug,
        is_system: false,
      });

      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteTag = useMutation({
    mutationFn: async (tagId: string) => {
      const authUserId = await ensureAuthSession();

      // Soft delete
      const { error } = await supabase
        .from('tags')
        .update({ deleted_at: new Date().toISOString() })
        .eq('tag_id', tagId)
        .eq('user_id', authUserId)
        .eq('is_system', false); // Can only delete custom tags

      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { createTag, deleteTag };
}
