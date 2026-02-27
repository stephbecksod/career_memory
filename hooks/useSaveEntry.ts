import { useMutation } from '@tanstack/react-query';
import { supabase, ensureAuthSession, withTimeout } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import { useCompanies } from '@/hooks/useCompanies';
import { todayLocalDate } from '@/lib/dates';
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

      // Validate auth session is active before any data queries (prevents hangs)
      const confirmedUserId = await ensureAuthSession();
      console.log('[SaveEntry] Auth session confirmed:', confirmedUserId);

      // 1. Reuse existing entry for today, or create a new one
      const today = todayLocalDate();
      let entryId: string;

      console.log('[SaveEntry] Looking up existing entry for:', today);
      const { data: existingEntries, error: lookupError } = await withTimeout(
        supabase
          .from('entries')
          .select('entry_id')
          .eq('user_id', confirmedUserId)
          .eq('entry_date', today)
          .is('deleted_at', null)
          .limit(1),
        10000,
        'Entry lookup',
      );

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
        console.log('[SaveEntry] Creating new entry:', entryId);
        const { error: entryError } = await withTimeout(
          supabase
            .from('entries')
            .insert({
              entry_id: entryId,
              user_id: confirmedUserId,
              entry_date: today,
              section_type: SECTION_TYPE.PROFESSIONAL,
              status: ENTRY_STATUS.COMPLETE,
            }),
          10000,
          'Entry insert',
        );

        if (entryError) {
          console.error('[SaveEntry] Entry insert failed:', entryError);
          throw entryError;
        }
        console.log('[SaveEntry] Entry created:', entryId);
      }

      // 2. Compute display_order
      console.log('[SaveEntry] Computing display order...');
      const { count: existingCount } = await withTimeout(
        supabase
          .from('professional_achievements')
          .select('achievement_id', { count: 'exact', head: true })
          .eq('entry_id', entryId)
          .is('deleted_at', null),
        10000,
        'Achievement count',
      );
      const displayOrder = (existingCount ?? 0) + 1;

      // 3. Create achievement with pending synthesis status
      const achievementId = crypto.randomUUID();
      console.log('[SaveEntry] Creating achievement:', achievementId);
      const achievementRow = {
        achievement_id: achievementId,
        entry_id: entryId,
        user_id: confirmedUserId,
        company_id: currentCompany?.company_id ?? null,
        company_name_snapshot: currentCompany?.name ?? null,
        role_title: profile?.default_role_title ?? null,
        project_id: projectId ?? null,
        display_order: displayOrder,
        source_platform: SOURCE_PLATFORM.MANUAL,
        synthesis_status: SYNTHESIS_STATUS.PENDING,
      };

      try {
        const { error: achievementError } = await withTimeout(
          supabase.from('professional_achievements').insert(achievementRow),
          10000,
          'Achievement insert',
        );

        if (achievementError) {
          console.error('[SaveEntry] Achievement insert failed:', achievementError);
          throw achievementError;
        }
      } catch (insertErr) {
        // On timeout, verify if the row actually landed before giving up
        console.warn('[SaveEntry] Achievement insert may have timed out, verifying...', insertErr);
        const { data: verifyRows } = await withTimeout(
          supabase
            .from('professional_achievements')
            .select('achievement_id')
            .eq('achievement_id', achievementId)
            .limit(1),
          8000,
          'Achievement verify',
        );

        if (!verifyRows || verifyRows.length === 0) {
          // Row didn't land — retry insert once
          console.log('[SaveEntry] Row not found, retrying insert...');
          const { error: retryError } = await withTimeout(
            supabase.from('professional_achievements').insert(achievementRow),
            15000,
            'Achievement insert retry',
          );
          if (retryError) {
            console.error('[SaveEntry] Achievement retry failed:', retryError);
            throw retryError;
          }
        } else {
          console.log('[SaveEntry] Achievement verified — insert succeeded despite timeout');
        }
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

      console.log('[SaveEntry] Saving responses...');
      const responseRows = responses.map((r) => ({
        achievement_id: achievementId,
        question_key: r.question_key,
        question_text_snapshot: r.question_text_snapshot,
        response_text: r.response_text,
      }));

      try {
        const { error: responsesError } = await withTimeout(
          supabase.from('achievement_responses').insert(responseRows),
          10000,
          'Responses insert',
        );

        if (responsesError) {
          console.error('[SaveEntry] Responses insert failed:', responsesError);
          throw responsesError;
        }
      } catch (respErr) {
        // Verify if responses actually landed
        console.warn('[SaveEntry] Responses insert may have timed out, verifying...', respErr);
        const { data: verifyResp } = await withTimeout(
          supabase
            .from('achievement_responses')
            .select('response_id')
            .eq('achievement_id', achievementId)
            .limit(1),
          8000,
          'Responses verify',
        );

        if (!verifyResp || verifyResp.length === 0) {
          console.log('[SaveEntry] Responses not found, retrying insert...');
          const { error: retryError } = await withTimeout(
            supabase.from('achievement_responses').insert(responseRows),
            15000,
            'Responses insert retry',
          );
          if (retryError) {
            console.error('[SaveEntry] Responses retry failed:', retryError);
            throw retryError;
          }
        } else {
          console.log('[SaveEntry] Responses verified — insert succeeded despite timeout');
        }
      }
      console.log('[SaveEntry] Responses saved. User input is safe.');

      return { entryId, achievementId };
    },
  });
}
