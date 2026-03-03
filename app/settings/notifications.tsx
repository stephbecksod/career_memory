import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/BackButton';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { useNotificationSchedules } from '@/hooks/useNotificationSchedules';
// Lazy-imported on native only to avoid expo-notifications crashing web bundle
import { colors } from '@/constants/colors';
import type { NotificationSchedule } from '@/types/database';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function decodeDaysBitmask(mask: number): number[] {
  const days: number[] = [];
  for (let i = 0; i < 7; i++) {
    if (mask & (1 << i)) days.push(i);
  }
  return days;
}

function formatScheduleDescription(s: NotificationSchedule): string {
  const time = s.notification_time || '';
  const dayName = s.day_of_week != null ? DAYS[s.day_of_week] : '';

  switch (s.cadence_type) {
    case 'weekly':
      return `Every ${dayName} · ${time}`;
    case 'monthly':
      return `Monthly · ${time}`;
    case 'quarterly':
      return `Quarterly · ${time}`;
    case 'custom': {
      // Daily schedule — decode bitmask
      if (s.day_of_week != null && s.day_of_week > 6) {
        const days = decodeDaysBitmask(s.day_of_week);
        if (days.length === 7) return `Every day · ${time}`;
        return `${days.map((d) => DAYS[d]).join(', ')} · ${time}`;
      }
      return `Daily · ${time}`;
    }
    default:
      return `${time}`;
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { data: schedules, isLoading, toggleSchedule, deleteSchedule } = useNotificationSchedules();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const isWeb = Platform.OS === 'web';

  // Request notification permissions on mount (native only)
  useEffect(() => {
    if (!isWeb) {
      import('@/lib/notifications').then(({ requestNotificationPermissions }) => {
        requestNotificationPermissions();
      });
    }
  }, [isWeb]);

  const handleToggle = (id: string, currentActive: boolean) => {
    toggleSchedule.mutate({ id, active: !currentActive });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSchedule.mutateAsync(id);
      setConfirmDeleteId(null);
    } catch {
      // Error handled
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/settings/notification-editor')}
        >
          <FontAwesome name="plus" size={12} color={colors.moss} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {(!schedules || schedules.length === 0) ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔔</Text>
              <Text style={styles.emptyText}>
                No schedules yet. Add one to start getting reminders.
              </Text>
            </View>
          ) : (
            <>
              <SectionLabel>Your schedules</SectionLabel>
              {schedules.map((schedule) => (
                <View key={schedule.schedule_id}>
                  <View
                    style={[
                      styles.card,
                      schedule.is_active ? styles.cardActive : styles.cardInactive,
                    ]}
                  >
                    <View style={styles.cardTop}>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardLabel}>
                          {schedule.label || (schedule.cadence_type === 'custom' ? 'Daily' : schedule.cadence_type)}
                        </Text>
                        <Text style={styles.cardDesc}>
                          {formatScheduleDescription(schedule)}
                        </Text>
                        <Text style={styles.cardTz}>{schedule.timezone}</Text>
                      </View>
                      <Switch
                        value={schedule.is_active}
                        onValueChange={() => handleToggle(schedule.schedule_id, schedule.is_active)}
                        trackColor={{ false: colors.blush, true: colors.moss }}
                        thumbColor={colors.white}
                      />
                    </View>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => router.push(`/settings/notification-editor?id=${schedule.schedule_id}`)}
                      >
                        <FontAwesome name="pencil" size={12} color={colors.umber} />
                        <Text style={styles.actionBtnText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtnDanger}
                        onPress={() => setConfirmDeleteId(schedule.schedule_id)}
                      >
                        <FontAwesome name="trash-o" size={13} color={colors.danger} />
                        <Text style={styles.actionBtnDangerText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Inline delete confirm */}
                  {confirmDeleteId === schedule.schedule_id && (
                    <View style={styles.confirmBox}>
                      <Text style={styles.confirmText}>
                        Delete "{schedule.label || (schedule.cadence_type === 'custom' ? 'Daily' : schedule.cadence_type)}"? This can't be undone.
                      </Text>
                      <View style={styles.confirmButtons}>
                        <TouchableOpacity
                          style={styles.confirmCancel}
                          onPress={() => setConfirmDeleteId(null)}
                        >
                          <Text style={styles.confirmCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.confirmDelete}
                          onPress={() => handleDelete(schedule.schedule_id)}
                        >
                          <Text style={styles.confirmDeleteText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </>
          )}

          {/* Info note */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              You can have multiple schedules running at once — e.g. a weekly check-in and a quarterly review.
            </Text>
          </View>

          {isWeb && (
            <View style={[styles.infoBox, { marginTop: 8 }]}>
              <Text style={styles.infoText}>
                Push notifications are available on mobile only. Your schedules are saved and will send notifications when you use the mobile app.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    color: colors.walnut,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.mossFaint,
    borderWidth: 1,
    borderColor: colors.mossBorder,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBtnText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12.5,
    color: colors.moss,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 14,
  },
  emptyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.umber,
    lineHeight: 22,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 9,
  },
  cardActive: {
    borderColor: colors.mossBorder,
  },
  cardInactive: {
    borderColor: colors.cardBorder,
    opacity: 0.65,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardInfo: {
    flex: 1,
  },
  cardLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14.5,
    color: colors.walnut,
    marginBottom: 3,
  },
  cardDesc: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.umber,
  },
  cardTz: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.umber,
    opacity: 0.7,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 6,
  },
  actionBtnText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.umber,
  },
  actionBtnDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 6,
  },
  actionBtnDangerText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.danger,
  },
  confirmBox: {
    backgroundColor: colors.dangerFaint,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 12,
    padding: 14,
    marginBottom: 9,
    marginTop: -3,
  },
  confirmText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.danger,
    lineHeight: 20,
    marginBottom: 12,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmCancel: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  confirmCancelText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
  },
  confirmDelete: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
  },
  confirmDeleteText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.white,
  },
  infoBox: {
    backgroundColor: colors.mossFaint,
    borderWidth: 1,
    borderColor: colors.mossBorder,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  infoText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12.5,
    color: colors.mossDeep,
    lineHeight: 20,
  },
});
