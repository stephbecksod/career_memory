-- 007: professional_achievements table
CREATE TABLE IF NOT EXISTS professional_achievements (
  achievement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES entries(entry_id),
  user_id UUID NOT NULL REFERENCES users(user_id),
  company_id UUID REFERENCES companies(company_id),
  company_name_snapshot TEXT,
  role_title TEXT,
  project_id UUID REFERENCES projects(project_id),
  display_order INTEGER NOT NULL DEFAULT 1,
  source_platform TEXT NOT NULL DEFAULT 'manual',

  -- AI Name
  ai_generated_name TEXT,
  ai_generated_name_ai TEXT,

  -- Synthesis
  synthesis_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (synthesis_status IN ('pending', 'processing', 'complete', 'error')),
  synthesis_paragraph TEXT,
  synthesis_paragraph_ai TEXT,
  synthesis_bullets JSONB,
  synthesis_bullets_ai JSONB,
  synthesis_last_edited_at TIMESTAMPTZ,
  synthesis_edited BOOLEAN NOT NULL DEFAULT false,

  -- STAR
  star_situation TEXT,
  star_situation_ai TEXT,
  star_task TEXT,
  star_task_ai TEXT,
  star_action TEXT,
  star_action_ai TEXT,
  star_result TEXT,
  star_result_ai TEXT,

  -- Completeness (null in V1)
  completeness_score INTEGER CHECK (completeness_score >= 0 AND completeness_score <= 100),
  completeness_flags JSONB,
  completeness_calculated_at TIMESTAMPTZ,

  -- Highlights
  is_highlight BOOLEAN NOT NULL DEFAULT false,
  highlight_note TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_achievements_user_id ON professional_achievements(user_id);
CREATE INDEX idx_achievements_entry ON professional_achievements(entry_id);
CREATE INDEX idx_achievements_project ON professional_achievements(project_id);
CREATE INDEX idx_achievements_company ON professional_achievements(company_id);
CREATE INDEX idx_achievements_highlight ON professional_achievements(user_id, is_highlight) WHERE is_highlight = true;
CREATE INDEX idx_achievements_deleted_at ON professional_achievements(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_achievements_synthesis_status ON professional_achievements(synthesis_status);

ALTER TABLE professional_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievements_select_own" ON professional_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "achievements_insert_own" ON professional_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "achievements_update_own" ON professional_achievements
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "achievements_delete_own" ON professional_achievements
  FOR DELETE USING (false);
