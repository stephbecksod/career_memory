import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, withTimeout } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import { useCompanies } from '@/hooks/useCompanies';
import { SYNTHESIS_STATUS, SOURCE_PLATFORM } from '@/constants/app';
import { synthesizeEntrySummary, synthesizeProjectSummary } from '@/lib/synthesis';
import type { SynthesisResult, SuggestedSplit } from '@/types/app';

interface SaveSynthesisInput {
  achievementId: string;
  entryId: string;
  synthesis: SynthesisResult;
  projectId?: string | null;
}

/**
 * Saves synthesis results to the achievement row and triggers secondary AI calls.
 * This is the second half of the save-before-synthesize pattern.
 * Handles: achievement update, tags, entry summary (Call 3), project summary (Call 4).
 */
export function useSaveSynthesis() {
  const userId = useUserStore((s) => s.authUser?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ achievementId, entryId, synthesis, projectId }: SaveSynthesisInput) => {
      if (!userId) throw new Error('Not authenticated');

      console.log('[SaveSynthesis] Saving synthesis results for:', achievementId);

      // 1. Check if _ai columns already exist (write-once enforcement)
      const { data: existing, error: fetchError } = await supabase
        .from('professional_achievements')
        .select('synthesis_paragraph_ai')
        .eq('achievement_id', achievementId)
        .limit(1);

      if (fetchError) {
        console.error('[SaveSynthesis] Fetch existing failed:', fetchError);
        throw fetchError;
      }

      const existingRow = existing && existing.length > 0 ? existing[0] : null;
      const isFirstWrite = !existingRow?.synthesis_paragraph_ai;

      // 2. Build update payload
      const updatePayload: Record<string, unknown> = {
        ai_generated_name: synthesis.ai_generated_name,
        synthesis_status: SYNTHESIS_STATUS.COMPLETE,
        synthesis_paragraph: synthesis.synthesis_paragraph,
        synthesis_bullets: synthesis.synthesis_bullets,
        star_situation: synthesis.star_situation,
        star_task: synthesis.star_task,
        star_action: synthesis.star_action,
        star_result: synthesis.star_result,
        completeness_score: synthesis.completeness_score,
        completeness_flags: synthesis.completeness_flags,
      };

      // Only write _ai columns on first synthesis (write-once rule)
      if (isFirstWrite) {
        updatePayload.ai_generated_name_ai = synthesis.ai_generated_name;
        updatePayload.synthesis_paragraph_ai = synthesis.synthesis_paragraph;
        updatePayload.synthesis_bullets_ai = synthesis.synthesis_bullets;
        updatePayload.star_situation_ai = synthesis.star_situation;
        updatePayload.star_task_ai = synthesis.star_task;
        updatePayload.star_action_ai = synthesis.star_action;
        updatePayload.star_result_ai = synthesis.star_result;
      }

      const { error: updateError } = await supabase
        .from('professional_achievements')
        .update(updatePayload)
        .eq('achievement_id', achievementId);

      if (updateError) {
        console.error('[SaveSynthesis] Achievement update failed:', updateError);
        // Mark as error status
        await supabase
          .from('professional_achievements')
          .update({ synthesis_status: SYNTHESIS_STATUS.ERROR })
          .eq('achievement_id', achievementId);
        throw updateError;
      }
      console.log('[SaveSynthesis] Achievement updated with synthesis results');

      // 3. Save tags (non-critical — don't throw on failure)
      if (synthesis.tag_suggestions.length > 0) {
        try {
          const { data: existingTags } = await supabase
            .from('tags')
            .select('tag_id, slug')
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
              console.error('[SaveSynthesis] Tags insert failed:', tagsError);
            }
          }
        } catch (tagErr) {
          console.error('[SaveSynthesis] Tags processing failed:', tagErr);
        }
      }

      // 4. Generate entry summary (Call 3) — non-blocking, fire and forget
      generateEntrySummary(entryId, achievementId, synthesis).catch((err) => {
        console.error('[SaveSynthesis] Entry summary generation failed:', err);
      });

      // 5. Generate project summary (Call 4) — non-blocking, if project assigned
      if (projectId) {
        generateProjectSummary(projectId, userId).catch((err) => {
          console.error('[SaveSynthesis] Project summary generation failed:', err);
        });
      }

      return { achievementId, entryId };
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['highlights'] });
    },
  });
}

/** Generate and save entry-level AI summary (Call 3) */
async function generateEntrySummary(
  entryId: string,
  _achievementId: string,
  currentSynthesis: SynthesisResult,
) {
  // Fetch all achievements for this entry to build the summary input
  const { data: achievements } = await supabase
    .from('professional_achievements')
    .select('ai_generated_name, synthesis_paragraph')
    .eq('entry_id', entryId)
    .is('deleted_at', null);

  const achievementList = (achievements ?? []).map((a) => ({
    name: a.ai_generated_name || currentSynthesis.ai_generated_name,
    paragraph: a.synthesis_paragraph || currentSynthesis.synthesis_paragraph,
  }));

  // If the just-saved achievement isn't reflected yet, make sure it's included
  if (achievementList.length === 0) {
    achievementList.push({
      name: currentSynthesis.ai_generated_name,
      paragraph: currentSynthesis.synthesis_paragraph,
    });
  }

  const summary = await synthesizeEntrySummary({ achievements: achievementList });

  // Check if _ai column already has a value (write-once)
  const { data: entryData } = await supabase
    .from('entries')
    .select('ai_generated_summary_ai')
    .eq('entry_id', entryId)
    .limit(1);

  const entry = entryData && entryData.length > 0 ? entryData[0] : null;

  const entryUpdate: Record<string, unknown> = {
    ai_generated_summary: summary,
  };
  if (!entry?.ai_generated_summary_ai) {
    entryUpdate.ai_generated_summary_ai = summary;
  }

  await supabase
    .from('entries')
    .update(entryUpdate)
    .eq('entry_id', entryId);

  console.log('[SaveSynthesis] Entry summary generated and saved');
}

/** Generate and save project summary (Call 4) */
async function generateProjectSummary(projectId: string, userId: string) {
  // Check if user has manually edited the summary
  const { data: projectData } = await supabase
    .from('projects')
    .select('name, description, highlight_summary_last_edited_at, highlight_summary_ai')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .limit(1);

  const project = projectData && projectData.length > 0 ? projectData[0] : null;
  if (!project) return;

  // If user has manually edited, don't auto-overwrite
  if (project.highlight_summary_last_edited_at) {
    console.log('[SaveSynthesis] Project summary manually edited — skipping auto-update');
    return;
  }

  // Fetch all achievements for this project
  const { data: achievements } = await supabase
    .from('professional_achievements')
    .select('ai_generated_name, synthesis_paragraph, created_at')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (!achievements || achievements.length === 0) return;

  const summary = await synthesizeProjectSummary({
    project_name: project.name,
    project_description: project.description,
    achievements: achievements.map((a) => ({
      name: a.ai_generated_name || 'Untitled achievement',
      paragraph: a.synthesis_paragraph || '',
      date: new Date(a.created_at).toISOString().slice(0, 10),
    })),
  });

  const projectUpdate: Record<string, unknown> = {
    highlight_summary: summary,
  };
  // Write-once for _ai column
  if (!project.highlight_summary_ai) {
    projectUpdate.highlight_summary_ai = summary;
  }

  await supabase
    .from('projects')
    .update(projectUpdate)
    .eq('project_id', projectId);

  console.log('[SaveSynthesis] Project summary generated and saved');
}

// --- Split achievements ---

interface SaveSplitInput {
  originalAchievementId: string;
  entryId: string;
  projectId: string | null;
  splits: SuggestedSplit[];
}

/**
 * Saves split achievements: soft-deletes the original, creates N new achievements
 * with full synthesis fields, tags, and triggers entry summary regeneration.
 */
export function useSaveSplitAchievements() {
  const userId = useUserStore((s) => s.authUser?.id);
  const profile = useUserStore((s) => s.profile);
  const { currentCompany } = useCompanies();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ originalAchievementId, entryId, projectId, splits }: SaveSplitInput) => {
      if (!userId) throw new Error('Not authenticated');

      console.log('[SaveSplit] Splitting into', splits.length, 'achievements');

      // 1. Soft-delete the original achievement
      const { error: deleteError } = await withTimeout(
        supabase
          .from('professional_achievements')
          .update({ deleted_at: new Date().toISOString() })
          .eq('achievement_id', originalAchievementId),
        10000,
        'Soft-delete original achievement',
      );
      if (deleteError) {
        console.error('[SaveSplit] Failed to soft-delete original:', deleteError);
        throw deleteError;
      }
      console.log('[SaveSplit] Original achievement soft-deleted:', originalAchievementId);

      // 2. Get current display_order base
      const { count: existingCount } = await withTimeout(
        supabase
          .from('professional_achievements')
          .select('achievement_id', { count: 'exact', head: true })
          .eq('entry_id', entryId)
          .is('deleted_at', null),
        10000,
        'Achievement count for split',
      );
      let displayOrder = (existingCount ?? 0) + 1;

      // 3. Create each split as a new achievement with full synthesis
      const createdIds: string[] = [];

      for (const split of splits) {
        const achievementId = crypto.randomUUID();
        createdIds.push(achievementId);

        const row: Record<string, unknown> = {
          achievement_id: achievementId,
          entry_id: entryId,
          user_id: userId,
          company_id: currentCompany?.company_id ?? null,
          company_name_snapshot: currentCompany?.name ?? null,
          role_title: profile?.default_role_title ?? null,
          project_id: projectId,
          display_order: displayOrder++,
          source_platform: SOURCE_PLATFORM.MANUAL,
          synthesis_status: SYNTHESIS_STATUS.COMPLETE,
          ai_generated_name: split.name,
          ai_generated_name_ai: split.name,
          synthesis_paragraph: split.paragraph,
          synthesis_paragraph_ai: split.paragraph,
          synthesis_bullets: split.bullets,
          synthesis_bullets_ai: split.bullets,
          star_situation: split.star_situation,
          star_situation_ai: split.star_situation,
          star_task: split.star_task,
          star_task_ai: split.star_task,
          star_action: split.star_action,
          star_action_ai: split.star_action,
          star_result: split.star_result,
          star_result_ai: split.star_result,
          completeness_score: split.completeness_score,
          completeness_flags: split.completeness_flags,
        };

        const { error: insertError } = await withTimeout(
          supabase.from('professional_achievements').insert(row),
          10000,
          `Split achievement insert ${createdIds.length}`,
        );
        if (insertError) {
          console.error('[SaveSplit] Achievement insert failed:', insertError);
          throw insertError;
        }
        console.log('[SaveSplit] Created split achievement:', achievementId);

        // Save tags (non-critical)
        if (split.tag_suggestions.length > 0) {
          try {
            const { data: existingTags } = await supabase
              .from('tags')
              .select('tag_id, slug')
              .in('slug', split.tag_suggestions)
              .is('deleted_at', null);

            const tagIds = (existingTags ?? []).map((t: { tag_id: string }) => t.tag_id);
            if (tagIds.length > 0) {
              await supabase.from('achievement_tags').insert(
                tagIds.map((tagId: string) => ({
                  achievement_id: achievementId,
                  tag_id: tagId,
                  is_ai_suggested: true,
                  is_confirmed: true,
                })),
              );
            }
          } catch (tagErr) {
            console.error('[SaveSplit] Tags processing failed for split:', tagErr);
          }
        }
      }

      // 4. Regenerate entry summary with all new achievements
      const lastSplit = splits[splits.length - 1];
      generateEntrySummary(entryId, createdIds[0], {
        ai_generated_name: lastSplit.name,
        synthesis_paragraph: lastSplit.paragraph,
        synthesis_bullets: lastSplit.bullets,
        star_situation: lastSplit.star_situation,
        star_task: lastSplit.star_task,
        star_action: lastSplit.star_action,
        star_result: lastSplit.star_result,
        tag_suggestions: lastSplit.tag_suggestions,
        completeness_score: lastSplit.completeness_score,
        completeness_flags: lastSplit.completeness_flags,
      }).catch((err) => {
        console.error('[SaveSplit] Entry summary regeneration failed:', err);
      });

      // 5. Regenerate project summary if applicable
      if (projectId) {
        generateProjectSummary(projectId, userId).catch((err) => {
          console.error('[SaveSplit] Project summary regeneration failed:', err);
        });
      }

      console.log('[SaveSplit] All splits saved successfully');
      return { entryId, achievementIds: createdIds };
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

/** Invalidate all entry-related queries. Reusable utility. */
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
