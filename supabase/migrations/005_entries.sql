-- 005: entries table
CREATE TABLE IF NOT EXISTS entries (
  entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id),
  session_id UUID REFERENCES sessions(session_id),
  entry_date DATE NOT NULL,
  section_type TEXT NOT NULL DEFAULT 'professional' CHECK (section_type IN ('professional', 'personal')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'complete')),
  ai_generated_summary TEXT,
  ai_generated_summary_ai TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_entries_user_id ON entries(user_id);
CREATE INDEX idx_entries_date ON entries(user_id, entry_date DESC);
CREATE INDEX idx_entries_session ON entries(session_id);
CREATE INDEX idx_entries_deleted_at ON entries(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entries_select_own" ON entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "entries_insert_own" ON entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "entries_update_own" ON entries
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "entries_delete_own" ON entries
  FOR DELETE USING (false);
