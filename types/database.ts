/**
 * TypeScript types for all 14 Supabase tables.
 * Derived from career_memory_schema.md
 */

export interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string | null;
  timezone: string;
  current_company_id: string | null;
  default_role_title: string | null;
  avatar_url: string | null;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Company {
  company_id: string;
  user_id: string;
  name: string;
  industry: string | null;
  role_title: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  logo_url: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface NotificationSchedule {
  schedule_id: string;
  user_id: string;
  label: string | null;
  cadence_type: 'weekly' | 'monthly' | 'quarterly' | 'custom';
  day_of_week: number | null;
  day_of_month: number | null;
  notification_time: string;
  timezone: string;
  first_question_preview: string | null;
  is_active: boolean;
  last_fired_at: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface Session {
  session_id: string;
  user_id: string;
  schedule_id: string | null;
  session_date: string;
  is_scheduled: boolean;
  cadence_snapshot: string | null;
  created_at: string;
}

export interface Entry {
  entry_id: string;
  user_id: string;
  session_id: string | null;
  entry_date: string;
  section_type: 'professional' | 'personal';
  status: 'draft' | 'complete';
  ai_generated_summary: string | null;
  ai_generated_summary_ai: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProfessionalAchievement {
  achievement_id: string;
  entry_id: string;
  user_id: string;
  company_id: string | null;
  company_name_snapshot: string | null;
  role_title: string | null;
  project_id: string | null;
  display_order: number;
  source_platform: string;
  ai_generated_name: string | null;
  ai_generated_name_ai: string | null;
  synthesis_status: 'pending' | 'processing' | 'complete' | 'error';
  synthesis_paragraph: string | null;
  synthesis_paragraph_ai: string | null;
  synthesis_bullets: string[] | null;
  synthesis_bullets_ai: string[] | null;
  synthesis_last_edited_at: string | null;
  synthesis_edited: boolean;
  star_situation: string | null;
  star_situation_ai: string | null;
  star_task: string | null;
  star_task_ai: string | null;
  star_action: string | null;
  star_action_ai: string | null;
  star_result: string | null;
  star_result_ai: string | null;
  completeness_score: number | null;
  completeness_flags: string[] | null;
  completeness_calculated_at: string | null;
  is_highlight: boolean;
  highlight_note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AchievementResponse {
  response_id: string;
  achievement_id: string;
  question_id: string | null;
  question_key: string | null;
  question_text_snapshot: string | null;
  response_text: string | null;
  audio_file_url: string | null;
  audio_duration_seconds: number | null;
  audio_expires_at: string | null;
  transcript_raw: string | null;
  created_at: string;
  updated_at: string;
}

export interface Question {
  question_id: string;
  user_id: string | null;
  question_text: string;
  question_key: string | null;
  section_type: 'professional' | 'personal' | 'both';
  is_system: boolean;
  is_active: boolean;
  display_order: number;
  helper_text: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface Project {
  project_id: string;
  user_id: string;
  company_id: string | null;
  name: string;
  description: string | null;
  status: 'active' | 'completed' | 'archived';
  start_date: string | null;
  end_date: string | null;
  is_highlight: boolean;
  highlight_summary: string | null;
  highlight_summary_ai: string | null;
  highlight_summary_last_edited_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Tag {
  tag_id: string;
  user_id: string | null;
  name: string;
  slug: string;
  category: 'skill' | 'theme' | 'outcome' | 'tool' | 'other' | null;
  is_system: boolean;
  color_hex: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface AchievementTag {
  achievement_tag_id: string;
  achievement_id: string;
  tag_id: string;
  is_ai_suggested: boolean;
  is_confirmed: boolean;
  created_at: string;
}

export interface UserPreference {
  preference_id: string;
  user_id: string;
  preference_key: string;
  preference_value: string;
  updated_at: string;
}

export interface ExportHistory {
  export_id: string;
  user_id: string;
  export_type: 'pdf' | 'google_doc' | 'linkedin_copy' | 'resume_bullets' | 'notion';
  date_range_start: string | null;
  date_range_end: string | null;
  company_id_filter: string | null;
  project_id_filter: string | null;
  tag_filters: string[] | null;
  achievement_count: number | null;
  status: 'pending' | 'complete' | 'failed';
  file_url: string | null;
  file_expires_at: string | null;
  created_at: string;
}

export interface Subscription {
  subscription_id: string;
  user_id: string;
  plan_type: 'free' | 'pro' | 'team' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}
