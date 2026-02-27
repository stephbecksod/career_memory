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

  return useMutation({
    mutationFn: async ({ mainInput, starInputs, synthesis, projectId }: CreateEntryInput) => {
      if (!userId) throw new Error('Not authenticated');

      console.log('[CreateEntry] userId:', userId);

      // Preflight: verify DB connectivity
      const { error: preflight } = await supabase
        .from('entries')
        .select('entry_id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('deleted_at', null);

      if (preflight) {
        console.error('[CreateEntry] Preflight failed:', preflight);
        throw new Error('Unable to connect to database. Please try again.');
      }
      console.log('[CreateEntry] Preflight OK');

      // 1. Reuse existing entry for today, or create a new one
      console.log('[CreateEntry] Step 1: Checking for existing entry today...');
      const today = new Date().toISOString().slice(0, 10);
      let entryId: string;

      const { data: existingEntries, error: lookupError } = await supabase
        .from('entries')
        .select('entry_id, ai_generated_summary')
        .eq('user_id', userId)
        .eq('entry_date', today)
        .is('deleted_at', null)
        .limit(1);

      if (lookupError) {
        console.error('[CreateEntry] Entry lookup failed:', lookupError);
        throw lookupError;
      }

      const existingEntry = existingEntries && existingEntries.length > 0 ? existingEntries[0] : null;

      if (existingEntry) {
        entryId = existingEntry.entry_id;
        console.log('[CreateEntry] Reusing existing entry:', entryId);
        // Update summary only if it was previously null
        if (!existingEntry.ai_generated_summary) {
          const { error: updateError } = await supabase
            .from('entries')
            .update({
              ai_generated_summary: synthesis.synthesis_paragraph,
              ai_generated_summary_ai: synthesis.synthesis_paragraph,
            })
            .eq('entry_id', entryId);
          if (updateError) {
            console.error('[CreateEntry] Entry summary update failed:', updateError);
          }
        }
      } else {
        entryId = crypto.randomUUID();
        const { error: entryError } = await supabase
          .from('entries')
          .insert({
            entry_id: entryId,
            user_id: userId,
            entry_date: today,
            section_type: SECTION_TYPE.PROFESSIONAL,
            status: ENTRY_STATUS.COMPLETE,
            ai_generated_summary: synthesis.synthesis_paragraph,
            ai_generated_summary_ai: synthesis.synthesis_paragraph,
          });

        if (entryError) {
          console.error('[CreateEntry] Entry insert failed:', entryError);
          throw entryError;
        }
        console.log('[CreateEntry] Entry created:', entryId);
      }

      // 2. Create achievement row
      console.log('[CreateEntry] Step 2: Inserting achievement...');
      // Compute next display_order for this entry
      const { count: existingCount } = await supabase
        .from('professional_achievements')
        .select('achievement_id', { count: 'exact', head: true })
        .eq('entry_id', entryId)
        .is('deleted_at', null);
      const displayOrder = (existingCount ?? 0) + 1;

      const achievementId = crypto.randomUUID();
      const { error: achievementError } = await supabase
        .from('professional_achievements')
        .insert({
          achievement_id: achievementId,
          entry_id: entryId,
          user_id: userId,
          company_id: currentCompany?.company_id ?? null,
          company_name_snapshot: currentCompany?.name ?? null,
          role_title: profile?.default_role_title ?? null,
          project_id: projectId ?? null,
          display_order: displayOrder,
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
        });

      if (achievementError) {
        console.error('[CreateEntry] Achievement insert failed:', achievementError);
        throw achievementError;
      }
      console.log('[CreateEntry] Achievement created:', achievementId);

      // 3. Create achievement_responses rows (save user's raw input)
      console.log('[CreateEntry] Step 3: Inserting responses...');
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
            achievement_id: achievementId,
            question_key: r.question_key,
            question_text_snapshot: r.question_text_snapshot,
            response_text: r.response_text,
          })),
        );

      if (responsesError) {
        console.error('[CreateEntry] Responses insert failed:', responsesError);
        throw responsesError;
      }
      console.log('[CreateEntry] Responses created');

      // 4. Create achievement_tags rows (non-critical)
      console.log('[CreateEntry] Step 4: Looking up tags...');
      if (synthesis.tag_suggestions.length > 0) {
        const { data: existingTags } = await supabase
          .from('tags')
          .select('*')
          .in('slug', synthesis.tag_suggestions)
          .is('deleted_at', null);

        const tagIds = (existingTags ?? []).map((t: { tag_id: string }) => t.tag_id);

        if (tagIds.length > 0) {
          const { error: tagsError } = await supabase.from('achievement_tags').insert(
            tagIds.map((tagId: string) => ({
              achievement_id: achievementId,
              tag_id: tagId,
              is_ai_suggested: true,
              is_confirmed: true,
            })),
          );
          if (tagsError) {
            console.error('[CreateEntry] Tags insert failed:', tagsError);
          }
        }
      }
      console.log('[CreateEntry] Done!');

      return { entryId, achievementId };
    },
  });
}

/** Invalidate all entry-related queries. Call after navigation completes. */
export function useInvalidateEntryQueries() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['entries'] });
    queryClient.invalidateQueries({ queryKey: ['achievements'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['highlights'] });
  };
}
