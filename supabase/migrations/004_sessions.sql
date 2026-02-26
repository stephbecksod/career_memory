-- 004: sessions table
CREATE TABLE IF NOT EXISTS sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id),
  schedule_id UUID REFERENCES notification_schedules(schedule_id),
  session_date DATE NOT NULL,
  is_scheduled BOOLEAN NOT NULL DEFAULT false,
  cadence_snapshot TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_schedule_id ON sessions(schedule_id);
CREATE INDEX idx_sessions_date ON sessions(user_id, session_date);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_select_own" ON sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "sessions_insert_own" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sessions_update_own" ON sessions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
