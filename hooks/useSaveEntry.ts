import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import { useCompanies } from '@/hooks/useCompanies';
import { SECTION_TYPE, ENTRY_STATUS, SYNTHESIS_STATUS, SOURCE_PLATFORM } from '@/constants/app';

interface SaveEntryInput {
  mainInput: string;
  starInputs: Record<string, string>;
  projectId?: string | null;
}

interface SaveEntryResult {
  entryId: string;
  achievementId: string;
}

/**
 * Saves raw user input to the database BEFORE synthesis.
 * Creates entry (or reuses today's), achievement with pending status, and response rows.
 * This is the first half of the save-before-synthesize pattern.
 */
export function useSaveEntry() {
  const userId = useUserStore((s) => s.authUser?.id);
  const profile = useUserStore((s) => s.profile);
  const { currentCompany } = useCompanies();

  return useMutation({
    mutationFn: async ({ mainInput, starInputs, projectId }: SaveEntryInput): Promise<SaveEntryResult> => {
      if (!userId) throw new Error('Not authenticated');

      console.log('[SaveEntry] Starting save-before-synthesize...');

      // 1. Reuse existing entry for today, or create a new one
      const today = new Date().toISOString().slice(0, 10);
      let entryId: string;

      const { data: existingEntries, error: lookupError } = await supabase
        .from('entries')
        .select('entry_id')
        .eq('user_id', userId)
        .eq('entry_date', today)
        .is('deleted_at', null)
        .limit(1);

      if (lookupError) {
        console.error('[SaveEntry] Entry lookup failed:', lookupError);
        throw lookupError;
      }

      const existingEntry = existingEntries && existingEntries.length > 0 ? existingEntries[0] : null;

      if (existingEntry) {
        entryId = existingEntry.entry_id;
        console.log('[SaveEntry] Reusing existing entry:', entryId);
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
          });

        if (entryError) {
          console.error('[SaveEntry] Entry insert failed:', entryError);
          throw entryError;
        }
        console.log('[SaveEntry] Entry created:', entryId);
      }

      // 2. Compute display_order
      const { count: existingCount } = await supabase
        .from('professional_achievements')
        .select('achievement_id', { count: 'exact', head: true })
        .eq('entry_id', entryId)
        .is('deleted_at', null);
      const displayOrder = (existingCount ?? 0) + 1;

      // 3. Create achievement with pending synthesis status
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
          synthesis_status: SYNTHESIS_STATUS.PENDING,
        });

      if (achievementError) {
        console.error('[SaveEntry] Achievement insert failed:', achievementError);
        throw achievementError;
      }
      console.log('[SaveEntry] Achievement created (pending):', achievementId);

      // 4. Save achievement_responses (user's raw input — must be saved before synthesis)
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
        console.error('[SaveEntry] Responses insert failed:', responsesError);
        throw responsesError;
      }
      console.log('[SaveEntry] Responses saved. User input is safe.');

      return { entryId, achievementId };
    },
  });
}
