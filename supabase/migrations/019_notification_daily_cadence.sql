-- 019: Support daily cadence with multi-day selection
-- Relax day_of_week constraint to allow bitmask values (0-127) for daily schedules
-- where each bit represents a day: Sun=1, Mon=2, Tue=4, Wed=8, Thu=16, Fri=32, Sat=64

ALTER TABLE notification_schedules DROP CONSTRAINT IF EXISTS notification_schedules_day_of_week_check;
ALTER TABLE notification_schedules ADD CONSTRAINT notification_schedules_day_of_week_check
  CHECK (day_of_week >= 0 AND day_of_week <= 127);
