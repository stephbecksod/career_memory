-- 010: tags table
CREATE TABLE IF NOT EXISTS tags (
  tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT CHECK (category IN ('skill', 'theme', 'outcome', 'tool', 'other')),
  is_system BOOLEAN NOT NULL DEFAULT false,
  color_hex TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Unique slug per user (or globally for system tags)
CREATE UNIQUE INDEX idx_tags_slug_user ON tags(slug, user_id) WHERE user_id IS NOT NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX idx_tags_slug_system ON tags(slug) WHERE user_id IS NULL AND deleted_at IS NULL;

CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_tags_system ON tags(is_system) WHERE is_system = true;

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- System tags (user_id IS NULL) readable by all authenticated users
-- User tags readable only by their owner
CREATE POLICY "tags_select" ON tags
  FOR SELECT USING (
    user_id IS NULL OR auth.uid() = user_id
  );

CREATE POLICY "tags_insert_own" ON tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tags_update_own" ON tags
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tags_delete_own" ON tags
  FOR DELETE USING (false);
