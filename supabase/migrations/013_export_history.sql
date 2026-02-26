-- 013: export_history table
CREATE TABLE IF NOT EXISTS export_history (
  export_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id),
  export_type TEXT NOT NULL
    CHECK (export_type IN ('pdf', 'google_doc', 'linkedin_copy', 'resume_bullets', 'notion')),
  date_range_start DATE,
  date_range_end DATE,
  company_id_filter UUID REFERENCES companies(company_id),
  project_id_filter UUID REFERENCES projects(project_id),
  tag_filters JSONB,
  achievement_count INTEGER,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'complete', 'failed')),
  file_url TEXT,
  file_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_export_history_user ON export_history(user_id);

ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "export_history_select_own" ON export_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "export_history_insert_own" ON export_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "export_history_update_own" ON export_history
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
