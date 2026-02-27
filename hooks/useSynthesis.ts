import { synthesizeAchievement } from '@/lib/synthesis';
import type { SynthesisResult, AchievementSynthesisInput } from '@/types/app';

/**
 * Hook wrapping the achievement synthesis API call.
 * Accepts raw user inputs and returns a structured SynthesisResult.
 */
export function useSynthesis() {
  const synthesize = async (
    mainInput: string,
    starInputs: Record<string, string>,
  ): Promise<SynthesisResult> => {
    const input: AchievementSynthesisInput = {
      headline: mainInput || undefined,
      situation: starInputs.situation || undefined,
      action: starInputs.action || undefined,
      result: starInputs.result || undefined,
      metrics: starInputs.metrics || undefined,
      skills: starInputs.skills || undefined,
      freeform: starInputs.freeform || undefined,
    };

    return synthesizeAchievement(input);
  };

  return { synthesize };
}
