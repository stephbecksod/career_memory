import type { SynthesisResult } from '@/types/app';

/**
 * Mock synthesis — generates structured output from raw input text.
 * Will be replaced with actual Claude Haiku API call via Supabase Edge Function.
 */
export function useSynthesis() {
  const synthesize = async (mainInput: string, starInputs: Record<string, string>): Promise<SynthesisResult> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const words = mainInput.split(/\s+/).filter(Boolean);
    const nameWords = words.slice(0, 6).join(' ');
    const aiName = nameWords.length > 0
      ? nameWords.charAt(0).toUpperCase() + nameWords.slice(1)
      : 'New Achievement';

    const paragraph = mainInput.length > 20
      ? mainInput
      : `Accomplished: ${mainInput}. This work demonstrated strong execution and delivered measurable impact.`;

    const bullets = [
      mainInput.length > 40 ? mainInput.slice(0, 40) + '…' : mainInput,
      'Delivered results on time and within scope',
      'Collaborated effectively with stakeholders',
    ];

    return {
      ai_generated_name: aiName,
      synthesis_paragraph: paragraph,
      synthesis_bullets: bullets,
      star_situation: starInputs.situation || 'The team needed to address a key business challenge.',
      star_task: starInputs.action ? `Take action: ${starInputs.action}` : 'Lead the effort to deliver on this initiative.',
      star_action: starInputs.action || `Executed on the following: ${mainInput.slice(0, 60)}`,
      star_result: starInputs.result || 'Successfully delivered the expected outcome with positive feedback.',
      tag_suggestions: ['leadership', 'execution', 'collaboration'],
      completeness_score: calculateCompleteness(mainInput, starInputs),
      completeness_flags: getCompletenessFlags(mainInput, starInputs),
    };
  };

  return { synthesize };
}

function calculateCompleteness(main: string, star: Record<string, string>): number {
  let score = 0;
  if (main.length > 10) score += 40;
  if (star.situation) score += 15;
  if (star.action) score += 15;
  if (star.result) score += 15;
  if (star.metrics) score += 15;
  return Math.min(score, 100);
}

function getCompletenessFlags(main: string, star: Record<string, string>): string[] {
  const flags: string[] = [];
  if (!star.situation) flags.push('situation');
  if (!star.action) flags.push('action');
  if (!star.result) flags.push('result');
  if (!star.metrics) flags.push('metrics');
  return flags;
}
