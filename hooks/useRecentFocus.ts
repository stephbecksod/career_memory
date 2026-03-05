import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import { synthesizeRecentFocus } from '@/lib/synthesis';

/**
 * Generates a Recent Focus AI summary once the user has 2+ synthesized achievements.
 * Fetches the most recent achievements, groups by entry, and calls the synthesis API.
 * Cached with 5-minute staleTime to avoid re-calling on every Home visit.
 */
export function useRecentFocus() {
  const userId = useUserStore((s) => s.authUser?.id);

  return useQuery({
    queryKey: ['recent-focus', userId],
    queryFn: async (): Promise<string | null> => {
      if (!userId) return null;

      // Fetch recent synthesized achievements (need at least 2)
      const { data: achievements } = await supabase
        .from('professional_achievements')
        .select('achievement_id, entry_id, ai_generated_name')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .not('ai_generated_name', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!achievements || achievements.length < 2) {
        return null; // Cold state — need at least 2 achievements
      }

      // Get the unique entry IDs for these achievements
      const entryIds = [...new Set(achievements.map((a) => a.entry_id))];

      // Fetch entry data for context
      const { data: entries } = await supabase
        .from('entries')
        .select('entry_id, entry_date, ai_generated_summary')
        .in('entry_id', entryIds)
        .is('deleted_at', null)
        .order('entry_date', { ascending: false });

      if (!entries || entries.length === 0) return null;

      // Group achievement names by entry
      const achievementsByEntry = new Map<string, string[]>();
      for (const a of achievements) {
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
