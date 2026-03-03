import { Platform } from 'react-native';
import type { NotificationSchedule } from '@/types/database';

// Lazy-load expo-notifications only on native platforms
let Notifications: typeof import('expo-notifications') | null = null;
let Device: typeof import('expo-device') | null = null;

async function getNotifications() {
  if (Platform.OS === 'web') return null;
  if (!Notifications) {
    Notifications = await import('expo-notifications');
  }
  return Notifications;
}

async function getDevice() {
  if (Platform.OS === 'web') return null;
  if (!Device) {
    Device = await import('expo-device');
  }
  return Device;
}

/**
 * Request notification permissions.
 * Returns true if granted, false otherwise. No-ops on web.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const notifs = await getNotifications();
  const device = await getDevice();
  if (!notifs || !device) return false;

  // Permissions only work on physical devices
  if (!device.isDevice) {
    console.log('[notifications] Not a physical device, skipping permission request');
    return false;
  }

  const { status: existing } = await notifs.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await notifs.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Set up the notification handler for foreground display and tap actions.
 * Call once on app mount. No-ops on web.
 */
export async function setupNotificationHandler(onTap?: () => void): Promise<() => void> {
  if (Platform.OS === 'web') return () => {};

  const notifs = await getNotifications();
  if (!notifs) return () => {};

  // Show notifications even when app is in foreground
  notifs.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Handle notification taps — navigate to new entry
  const subscription = notifs.addNotificationResponseReceivedListener(() => {
    onTap?.();
  });

  return () => subscription.remove();
}

/**
 * Sync all notification schedules — cancels all existing, re-schedules active ones.
 * No-ops on web.
 */
export async function syncAllSchedules(schedules: NotificationSchedule[]): Promise<void> {
  if (Platform.OS === 'web') return;

  const notifs = await getNotifications();
  if (!notifs) return;

  // Cancel all existing scheduled notifications
  await notifs.cancelAllScheduledNotificationsAsync();

  // Schedule active ones
  const activeSchedules = schedules.filter((s) => s.is_active);

  for (const schedule of activeSchedules) {
    await scheduleNotificationsForSchedule(notifs, schedule);
  }

  console.log(`[notifications] Synced ${activeSchedules.length} active schedule(s)`);
}

/**
 * Cancel notifications for a specific schedule (by cancelling all and re-syncing).
 * This is simpler than tracking individual notification IDs.
 */
export async function cancelNotificationsForSchedule(
  allSchedules: NotificationSchedule[],
  scheduleId: string,
): Promise<void> {
  // Re-sync without the cancelled schedule
  const remaining = allSchedules.filter((s) => s.schedule_id !== scheduleId);
  await syncAllSchedules(remaining);
}

// ---- Internal helpers ----

async function scheduleNotificationsForSchedule(
  notifs: typeof import('expo-notifications'),
  schedule: NotificationSchedule,
): Promise<void> {
  const [hourStr, minuteStr] = (schedule.notification_time || '09:00').split(':');
  const hour = parseInt(hourStr, 10) || 9;
  const minute = parseInt(minuteStr, 10) || 0;

  const content = {
    title: 'Career Memory',
    body: schedule.first_question_preview || 'Time to log your latest achievement!',
  };

  if (schedule.cadence_type === 'weekly' && schedule.day_of_week != null) {
    // Expo weekday: 1=Sunday, 7=Saturday. DB stores 0=Sunday, 6=Saturday.
    const expoWeekday = schedule.day_of_week + 1;

    await notifs.scheduleNotificationAsync({
      content,
      trigger: {
        type: notifs.SchedulableTriggerInputTypes.WEEKLY,
        weekday: expoWeekday,
        hour,
        minute,
      },
    });
  } else {
    // Monthly, quarterly, biweekly — no native repeating trigger.
    // Compute next 3 occurrences and schedule as exact dates.
    const dates = computeNextOccurrences(schedule, 3);

    for (const date of dates) {
      await notifs.scheduleNotificationAsync({
        content,
        trigger: {
          type: notifs.SchedulableTriggerInputTypes.DATE,
          date,
        },
      });
    }
  }
}

/**
 * Compute the next N occurrence dates for non-weekly schedules.
 */
function computeNextOccurrences(schedule: NotificationSchedule, count: number): Date[] {
  const [hourStr, minuteStr] = (schedule.notification_time || '09:00').split(':');
  const hour = parseInt(hourStr, 10) || 9;
  const minute = parseInt(minuteStr, 10) || 0;

  const now = new Date();
  const dates: Date[] = [];
  let cursor = new Date(now);

  for (let i = 0; i < count * 2 && dates.length < count; i++) {
    let next: Date | null = null;

    if (schedule.cadence_type === 'monthly') {
      const dayOfMonth = schedule.day_of_month ?? 1;
      next = new Date(cursor.getFullYear(), cursor.getMonth(), dayOfMonth, hour, minute, 0);
      if (next <= now || (dates.length > 0 && next <= dates[dates.length - 1])) {
        // Move to next month
        next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, dayOfMonth, hour, minute, 0);
      }
      cursor = new Date(next);
      cursor.setMonth(cursor.getMonth() + 1);
    } else if (schedule.cadence_type === 'quarterly') {
      const dayOfMonth = schedule.day_of_month ?? 1;
      next = new Date(cursor.getFullYear(), cursor.getMonth(), dayOfMonth, hour, minute, 0);
      if (next <= now || (dates.length > 0 && next <= dates[dates.length - 1])) {
        next = new Date(cursor.getFullYear(), cursor.getMonth() + 3, dayOfMonth, hour, minute, 0);
      }
      cursor = new Date(next);
      cursor.setMonth(cursor.getMonth() + 3);
    } else {
      // Custom / biweekly — treat as biweekly
      const dayOfWeek = schedule.day_of_week ?? 1; // Monday default
      next = new Date(cursor);
      next.setHours(hour, minute, 0, 0);
      // Find next occurrence of dayOfWeek
      const daysUntil = (dayOfWeek - next.getDay() + 7) % 7 || 7;
      next.setDate(next.getDate() + daysUntil);
      if (next <= now) {
        next.setDate(next.getDate() + 14);
      }
      cursor = new Date(next);
      cursor.setDate(cursor.getDate() + 14);
    }

    if (next && next > now) {
      dates.push(next);
    }
  }

  return dates;
}
