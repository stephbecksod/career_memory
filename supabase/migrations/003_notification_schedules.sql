-- 003: notification_schedules table
CREATE TABLE IF NOT EXISTS notification_schedules (
  schedule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id),
  label TEXT,
  cadence_type TEXT NOT NULL CHECK (cadence_type IN ('weekly', 'monthly', 'quarterly', 'custom')),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31),
  notification_time TIME NOT NULL,
  timezone TEXT NOT NULL,
  first_question_preview TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_fired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_notification_schedules_user_id ON notification_schedules(user_id);
CREATE INDEX idx_notification_schedules_active ON notification_schedules(user_id, is_active) WHERE is_active = true;

ALTER TABLE notification_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_schedules_select_own" ON notification_schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notification_schedules_insert_own" ON notification_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notification_schedules_update_own" ON notification_schedules
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notification_schedules_delete_own" ON notification_schedules
  FOR DELETE USING (false);
