import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import type { Project } from '@/types/database';

export interface ProjectWithCount extends Project {
  achievement_count: number;
}

export function useProjects() {
  const userId = useUserStore((s) => s.authUser?.id);
  const queryClient = useQueryClient();

  const query = useQuery<ProjectWithCount[]>({
    queryKey: ['projects', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId!)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Compute live achievement counts
      const withCounts = await Promise.all(
        (projects ?? []).map(async (project: Project) => {
          const { count } = await supabase
            .from('professional_achievements')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.project_id)
            .is('deleted_at', null);

          return { ...project, achievement_count: count ?? 0 } as ProjectWithCount;
        }),
      );

      return withCounts;
    },
  });

  const createProject = useMutation({
    mutationFn: async (input: { name: string; description?: string; company_id?: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId!,
          name: input.name,
          description: input.description ?? null,
          company_id: input.company_id ?? null,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', userId] });
    },
  });

  return { ...query, createProject };
}
