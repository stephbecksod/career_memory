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
  star_situation: string | null;
  star_task: string | null;
  star_action: string | null;
  star_result: string | null;
  tag_suggestions: string[];
  completeness_score: number;
  completeness_flags: string[];
}

/** Input for achievement synthesis Edge Function */
export interface AchievementSynthesisInput {
  headline?: string;
  situation?: string;
  action?: string;
  result?: string;
  metrics?: string;
  skills?: string;
  freeform?: string;
}

/** Input for entry summary synthesis */
export interface EntrySummaryInput {
  achievements: Array<{ name: string; paragraph: string }>;
}

/** Input for project summary synthesis */
export interface ProjectSummaryInput {
  project_name: string;
  project_description?: string | null;
  achievements: Array<{ name: string; paragraph: string; date: string }>;
}

/** Input for recent focus synthesis */
export interface RecentFocusInput {
  entries: Array<{
    entry_date: string;
    entry_summary: string;
    achievement_names: string[];
  }>;
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
