import type { ProfessionalAchievement, Entry, Project } from './database';

/** Navigation target state for deep-linking from Home highlights */
export interface NavigationTargets {
  targetProjectId: string | null;
  targetAchievementId: string | null;
}

/** Add Entry flow step */
export type EntryFlowStep = 'input' | 'processing' | 'review';

/** Processing step labels for the pulsing orb animation */
export type ProcessingStage =
  | 'Reading your entry…'
  | 'Identifying achievements…'
  | 'Building your synthesis…'
  | 'Finalizing…';

/** Entries page view toggle */
export type EntriesViewMode = 'by_entry' | 'by_achievement';

/** Synthesis result from Claude API */
export interface SynthesisResult {
  ai_generated_name: string;
  synthesis_paragraph: string;
  synthesis_bullets: string[];
  star_situation: string;
  star_task: string;
  star_action: string;
  star_result: string;
  tag_suggestions: string[];
  completeness_score: number;
  completeness_flags: string[];
}

/** Highlight item for Home highlights reel */
export interface HighlightItem {
  id: string;
  name: string;
  type: 'achievement' | 'project';
  item: ProfessionalAchievement | Project;
}

/** Entry card display data */
export interface EntryCardData extends Entry {
  achievements: ProfessionalAchievement[];
}

/** Status badge config */
export interface StatusBadge {
  label: string;
  bg: string;
  border: string;
  color: string;
}
