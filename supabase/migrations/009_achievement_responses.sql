-- 009: achievement_responses table
CREATE TABLE IF NOT EXISTS achievement_responses (
  response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id UUID NOT NULL REFERENCES professional_achievements(achievement_id),
  question_id UUID REFERENCES questions(question_id),
  question_key TEXT,
  question_text_snapshot TEXT,
  response_text TEXT,
  audio_file_url TEXT,
  audio_duration_seconds INTEGER,
  audio_expires_at TIMESTAMPTZ,
  transcript_raw TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_responses_achievement ON achievement_responses(achievement_id);
CREATE INDEX idx_responses_question ON achievement_responses(question_id);
CREATE INDEX idx_responses_audio_expires ON achievement_responses(audio_expires_at)
  WHERE audio_file_url IS NOT NULL;

ALTER TABLE achievement_responses ENABLE ROW LEVEL SECURITY;

-- RLS through achievement ownership: join to professional_achievements to check user_id
CREATE POLICY "responses_select_own" ON achievement_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM professional_achievements pa
      WHERE pa.achievement_id = achievement_responses.achievement_id
        AND pa.user_id = auth.uid()
    )
  );

CREATE POLICY "responses_insert_own" ON achievement_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM professional_achievements pa
      WHERE pa.achievement_id = achievement_responses.achievement_id
        AND pa.user_id = auth.uid()
    )
  );

CREATE POLICY "responses_update_own" ON achievement_responses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM professional_achievements pa
      WHERE pa.achievement_id = achievement_responses.achievement_id
        AND pa.user_id = auth.uid()
    )
  );
