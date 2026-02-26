-- 012: user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  preference_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id),
  preference_key TEXT NOT NULL,
  preference_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_user_preferences_key ON user_preferences(user_id, preference_key);
CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "preferences_select_own" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "preferences_insert_own" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "preferences_update_own" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "preferences_delete_own" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);
