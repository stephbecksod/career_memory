-- 008: questions table
CREATE TABLE IF NOT EXISTS questions (
  question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id),
  question_text TEXT NOT NULL,
  question_key TEXT,
  section_type TEXT NOT NULL DEFAULT 'professional'
    CHECK (section_type IN ('professional', 'personal', 'both')),
  is_system BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  helper_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_system ON questions(is_system) WHERE is_system = true;
CREATE INDEX idx_questions_key ON questions(question_key);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- System questions (user_id IS NULL) readable by all authenticated users
-- User questions readable only by their owner
CREATE POLICY "questions_select" ON questions
  FOR SELECT USING (
    user_id IS NULL OR auth.uid() = user_id
  );

CREATE POLICY "questions_insert_own" ON questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "questions_update_own" ON questions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "questions_delete_own" ON questions
  FOR DELETE USING (false);
