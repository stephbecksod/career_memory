-- 011: achievement_tags join table
CREATE TABLE IF NOT EXISTS achievement_tags (
  achievement_tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id UUID NOT NULL REFERENCES professional_achievements(achievement_id),
  tag_id UUID NOT NULL REFERENCES tags(tag_id),
  is_ai_suggested BOOLEAN NOT NULL DEFAULT false,
  is_confirmed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_achievement_tags_achievement ON achievement_tags(achievement_id);
CREATE INDEX idx_achievement_tags_tag ON achievement_tags(tag_id);
CREATE UNIQUE INDEX idx_achievement_tags_unique ON achievement_tags(achievement_id, tag_id);

ALTER TABLE achievement_tags ENABLE ROW LEVEL SECURITY;

-- RLS through achievement ownership
CREATE POLICY "achievement_tags_select_own" ON achievement_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM professional_achievements pa
      WHERE pa.achievement_id = achievement_tags.achievement_id
        AND pa.user_id = auth.uid()
    )
  );

CREATE POLICY "achievement_tags_insert_own" ON achievement_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM professional_achievements pa
      WHERE pa.achievement_id = achievement_tags.achievement_id
        AND pa.user_id = auth.uid()
    )
  );

CREATE POLICY "achievement_tags_update_own" ON achievement_tags
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM professional_achievements pa
      WHERE pa.achievement_id = achievement_tags.achievement_id
        AND pa.user_id = auth.uid()
    )
  );

-- No deletes — use is_confirmed = false instead
CREATE POLICY "achievement_tags_delete" ON achievement_tags
  FOR DELETE USING (false);
