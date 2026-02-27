import { supabase } from '@/lib/supabase';
import type {
  SynthesisResult,
  AchievementSynthesisInput,
  EntrySummaryInput,
  ProjectSummaryInput,
  RecentFocusInput,
} from '@/types/app';

async function invokeSynthesize<T>(type: string, payload: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke('synthesize', {
    body: { type, payload },
  });

  if (error) {
    console.error(`[synthesis] Edge Function error (${type}):`, error);
    throw new Error(error.message || 'Synthesis request failed');
  }

  if (data?.error) {
    console.error(`[synthesis] API error (${type}):`, data.error);
    throw new Error(data.error);
  }

  return data as T;
}

/** Call 1: Full achievement synthesis — returns structured JSON */
export async function synthesizeAchievement(
  input: AchievementSynthesisInput,
): Promise<SynthesisResult> {
  return invokeSynthesize<SynthesisResult>('achievement', input);
}

/** Call 3: Entry summary — returns plain text string */
export async function synthesizeEntrySummary(
  input: EntrySummaryInput,
): Promise<string> {
  const result = await invokeSynthesize<{ text: string }>('entry_summary', input);
  return result.text;
}

/** Call 4: Project summary — returns plain text string */
export async function synthesizeProjectSummary(
  input: ProjectSummaryInput,
): Promise<string> {
  const result = await invokeSynthesize<{ text: string }>('project_summary', input);
  return result.text;
}

/** Call 5: Recent focus — returns plain text string */
export async function synthesizeRecentFocus(
  input: RecentFocusInput,
): Promise<string> {
  const result = await invokeSynthesize<{ text: string }>('recent_focus', input);
  return result.text;
}
