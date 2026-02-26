import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import { useCompanies } from '@/hooks/useCompanies';
import { SECTION_TYPE, ENTRY_STATUS, SYNTHESIS_STATUS, SOURCE_PLATFORM } from '@/constants/app';
import type { SynthesisResult } from '@/types/app';

interface CreateEntryInput {
  mainInput: string;
  starInputs: Record<string, string>;
  synthesis: SynthesisResult;
  projectId?: string | null;
}

export function useCreateEntry() {
  const userId = useUserStore((s) => s.authUser?.id);
  const profile = useUserStore((s) => s.profile);
  const { currentCompany } = useCompanies();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mainInput, starInputs, synthesis, projectId }: CreateEntryInput) => {
      if (!userId) throw new Error('Not authenticated');

      // 1. Create entry row
      const { data: entry, error: entryError } = await supabase
        .from('entries')
        .insert({
          user_id: userId,
          entry_date: new Date().toISOString().slice(0, 10),
          section_type: SECTION_TYPE.PROFESSIONAL,
          status: ENTRY_STATUS.COMPLETE,
          ai_generated_summary: synthesis.synthesis_paragraph,
          ai_generated_summary_ai: synthesis.synthesis_paragraph,
        })
        .select()
        .single();

      if (entryError) throw entryError;

      // 2. Create achievement row with synthesis + _ai columns (write-once)
      const { data: achievement, error: achievementError } = await supabase
        .from('professional_achievements')
        .insert({
          entry_id: entry.entry_id,
          user_id: userId,
          company_id: currentCompany?.company_id ?? null,
          company_name_snapshot: currentCompany?.name ?? null,
          role_title: profile?.default_role_title ?? null,
          project_id: projectId ?? null,
          display_order: 1,
          source_platform: SOURCE_PLATFORM.MANUAL,
          ai_generated_name: synthesis.ai_generated_name,
          ai_generated_name_ai: synthesis.ai_generated_name,
          synthesis_status: SYNTHESIS_STATUS.COMPLETE,
          synthesis_paragraph: synthesis.synthesis_paragraph,
          synthesis_paragraph_ai: synthesis.synthesis_paragraph,
          synthesis_bullets: synthesis.synthesis_bullets,
          synthesis_bullets_ai: synthesis.synthesis_bullets,
          star_situation: synthesis.star_situation,
          star_situation_ai: synthesis.star_situation,
          star_task: synthesis.star_task,
          star_task_ai: synthesis.star_task,
          star_action: synthesis.star_action,
          star_action_ai: synthesis.star_action,
          star_result: synthesis.star_result,
          star_result_ai: synthesis.star_result,
          completeness_score: synthesis.completeness_score,
          completeness_flags: synthesis.completeness_flags,
        })
        .select()
        .single();

      if (achievementError) throw achievementError;

      // 3. Create achievement_responses rows (save user's raw input)
      const responses = [
        { question_key: 'headline', question_text_snapshot: 'What did you accomplish?', response_text: mainInput },
        ...Object.entries(starInputs)
          .filter(([, v]) => v.trim().length > 0)
          .map(([key, text]) => ({
            question_key: key,
            question_text_snapshot: key,
            response_text: text,
          })),
      ];

      const { error: responsesError } = await supabase
        .from('achievement_responses')
        .insert(
          responses.map((r) => ({
            achievement_id: achievement.achievement_id,
            question_key: r.question_key,
            question_text_snapshot: r.question_text_snapshot,
            response_text: r.response_text,
          })),
        );

      if (responsesError) throw responsesError;

      // 4. Create achievement_tags rows
      if (synthesis.tag_suggestions.length > 0) {
        // Look up existing tags by slug
        const { data: existingTags } = await supabase
          .from('tags')
          .select('*')
          .in('slug', synthesis.tag_suggestions)
          .is('deleted_at', null);

        const tagIds = (existingTags ?? []).map((t: { tag_id: string }) => t.tag_id);

        if (tagIds.length > 0) {
          await supabase.from('achievement_tags').insert(
            tagIds.map((tagId: string) => ({
              achievement_id: achievement.achievement_id,
              tag_id: tagId,
              is_ai_suggested: true,
              is_confirmed: true,
            })),
          );
        }
      }

      return { entry, achievement };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['highlights'] });
    },
  });
}
