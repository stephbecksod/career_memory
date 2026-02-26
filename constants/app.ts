export const SYNTHESIS_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETE: 'complete',
  ERROR: 'error',
} as const;

export const SECTION_TYPE = {
  PROFESSIONAL: 'professional',
  PERSONAL: 'personal',
} as const;

export const ENTRY_STATUS = {
  DRAFT: 'draft',
  COMPLETE: 'complete',
} as const;

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

export const CADENCE_TYPE = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  CUSTOM: 'custom',
} as const;

export const PLAN_TYPE = {
  FREE: 'free',
  PRO: 'pro',
  TEAM: 'team',
  ENTERPRISE: 'enterprise',
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  TRIALING: 'trialing',
  PAUSED: 'paused',
} as const;

export const EXPORT_TYPE = {
  PDF: 'pdf',
  GOOGLE_DOC: 'google_doc',
  LINKEDIN_COPY: 'linkedin_copy',
  RESUME_BULLETS: 'resume_bullets',
  NOTION: 'notion',
} as const;

export const EXPORT_STATUS = {
  PENDING: 'pending',
  COMPLETE: 'complete',
  FAILED: 'failed',
} as const;

export const TAG_CATEGORY = {
  SKILL: 'skill',
  THEME: 'theme',
  OUTCOME: 'outcome',
  TOOL: 'tool',
  OTHER: 'other',
} as const;

export const SOURCE_PLATFORM = {
  MANUAL: 'manual',
  IMPORT: 'import',
  API: 'api',
  SLACK: 'slack_integration',
} as const;

export const PREFERENCE_KEY = {
  SYNTHESIS_FORMAT: 'synthesis_format',
  SHOW_COMPLETENESS_NUDGE: 'show_completeness_nudge',
  DEFAULT_SECTION_TYPE: 'default_section_type',
  NOTIFICATION_SOUND: 'notification_sound',
  THEME: 'theme',
  AUDIO_RETENTION_DAYS: 'audio_retention_days',
  HAS_SEEN_ENTRIES_TOUR: 'has_seen_entries_tour',
  HAS_SEEN_PROJECTS_TOUR: 'has_seen_projects_tour',
  HAS_SEEN_SUMMARY_TOUR: 'has_seen_summary_tour',
} as const;
