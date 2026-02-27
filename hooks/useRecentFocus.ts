import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import { synthesizeRecentFocus } from '@/lib/synthesis';

/**
 * Fetches the 3 most recent entries and generates a Recent Focus AI summary.
 * Returns null if fewer than 3 entries exist (cold state).
 * Cached with 5-minute staleTime to avoid re-calling on every Home visit.
 */
export function useRecentFocus() {
  const userId = useUserStore((s) => s.authUser?.id);

  return useQuery({
    queryKey: ['recent-focus', userId],
    queryFn: async (): Promise<string | null> => {
      if (!userId) return null;

      // Fetch 3 most recent entries with their summaries
      const { data: entries } = await supabase
        .from('entries')
        .select('entry_id, entry_date, ai_generated_summary')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('entry_date', { ascending: false })
        .limit(3);

      if (!entries || entries.length < 3) {
        return null; // Cold state
      }

      // Fetch achievement names for each entry
      const entryIds = entries.map((e) => e.entry_id);
      const { data: achievements } = await supabase
        .from('professional_achievements')
        .select('entry_id, ai_generated_name')
        .in('entry_id', entryIds)
        .is('deleted_at', null);

      // Skip if none of the entries have real synthesized content yet
      const hasAnySynthesis = (achievements ?? []).some((a) => a.ai_generated_name);
      const hasAnySummary = entries.some((e) => e.ai_generated_summary);
      if (!hasAnySynthesis && !hasAnySummary) {
        console.log('[RecentFocus] No synthesized content yet — skipping API call');
        return null;
      }

      const achievementsByEntry = new Map<string, string[]>();
      for (const a of achievements ?? []) {
        const names = achievementsByEntry.get(a.entry_id) ?? [];
        names.push(a.ai_generated_name || 'Untitled');
        achievementsByEntry.set(a.entry_id, names);
      }

      // Build input for the API call
      const input = {
        entries: entries.map((e) => ({
          entry_date: e.entry_date,
          entry_summary: e.ai_generated_summary || 'No summary available',
          achievement_names: achievementsByEntry.get(e.entry_id) ?? [],
        })),
      };

      try {
        return await synthesizeRecentFocus(input);
      } catch (err) {
        console.warn('[RecentFocus] Summary generation failed — showing cold state:', err);
        return null;
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
