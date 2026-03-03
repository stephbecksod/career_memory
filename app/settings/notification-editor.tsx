import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useNotificationSchedules } from '@/hooks/useNotificationSchedules';
import { colors } from '@/constants/colors';

const ALL_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CADENCES = ['weekly', 'biweekly', 'monthly', 'quarterly'] as const;
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
const OCCURRENCES = ['1st', '2nd', '3rd', '4th'];
const SPECIFIC_DATES = ['1st', '15th', 'Last'];
const Q_MONTHS = ['1st month', '2nd month', '3rd month'];

const TIMEZONES = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central Europe (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)' },
  { value: 'Asia/Shanghai', label: 'China (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

type CadenceType = typeof CADENCES[number];

function dayNameToIndex(name: string): number {
  return ALL_DAYS.indexOf(name);
}

export default function NotificationEditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: schedules, createSchedule, updateSchedule } = useNotificationSchedules();
  const editing = !!id;

  const existingSchedule = schedules?.find((s) => s.schedule_id === id);

  const [label, setLabel] = useState('');
  const [cadence, setCadence] = useState<CadenceType>('weekly');
  const [weekDay, setWeekDay] = useState('Fri');
  const [monthMode, setMonthMode] = useState<'occurrence' | 'date'>('occurrence');
  const [occurrence, setOccurrence] = useState('1st');
  const [occDay, setOccDay] = useState('Mon');
  const [specificDate, setSpecificDate] = useState('1st');
  const [qMonth, setQMonth] = useState('1st month');
  const [hour, setHour] = useState('5');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState('PM');
  const [tz, setTz] = useState('America/Los_Angeles');
  const [preview, setPreview] = useState('What did you accomplish this week? 🎯');
  const [customPreview, setCustomPreview] = useState(false);
  const [tzOpen, setTzOpen] = useState(false);

  useEffect(() => {
    if (existingSchedule) {
      setLabel(existingSchedule.label || '');
      setCadence(existingSchedule.cadence_type as CadenceType);
      if (existingSchedule.day_of_week != null) {
        setWeekDay(ALL_DAYS[existingSchedule.day_of_week]);
      }
      if (existingSchedule.notification_time) {
        const timeStr = existingSchedule.notification_time;
        // Try 12h format first (e.g. "5:00 PM")
        const ampmMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (ampmMatch) {
          setHour(ampmMatch[1]);
          setMinute(ampmMatch[2]);
          setAmpm(ampmMatch[3].toUpperCase());
        } else {
          // 24h format (e.g. "17:00")
          const parts24 = timeStr.match(/(\d+):(\d+)/);
          if (parts24) {
            let h = parseInt(parts24[1], 10);
            const m = parts24[2];
            const ap = h >= 12 ? 'PM' : 'AM';
            if (h === 0) h = 12;
            else if (h > 12) h -= 12;
            setHour(String(h));
            setMinute(m);
            setAmpm(ap);
          }
        }
      }
      setTz(existingSchedule.timezone);
      if (existingSchedule.first_question_preview) {
        setPreview(existingSchedule.first_question_preview);
      }
    }
  }, [existingSchedule]);

  const scheduleSummary = useMemo(() => {
    const t = `${hour}:${minute} ${ampm}`;
    const tzLabel = TIMEZONES.find((z) => z.value === tz)?.label || tz;
    if (cadence === 'weekly') return `Every ${weekDay} at ${t} · ${tzLabel}`;
    if (cadence === 'biweekly') return `Every other ${weekDay} at ${t} · ${tzLabel}`;
    if (cadence === 'monthly') {
      if (monthMode === 'occurrence') return `${occurrence} ${occDay} of each month at ${t} · ${tzLabel}`;
      return `${specificDate} of each month at ${t} · ${tzLabel}`;
    }
    if (cadence === 'quarterly') {
      if (monthMode === 'occurrence') return `${occurrence} ${occDay} of the ${qMonth} of each quarter at ${t} · ${tzLabel}`;
      return `${specificDate} of the ${qMonth} of each quarter at ${t} · ${tzLabel}`;
    }
    return '';
  }, [cadence, weekDay, monthMode, occurrence, occDay, specificDate, qMonth, hour, minute, ampm, tz]);

  const handleSave = async () => {
    const timeStr = `${hour}:${minute} ${ampm}`;
    const dbCadence = cadence === 'biweekly' ? 'custom' : cadence;
    const dayOfWeek = (cadence === 'weekly' || cadence === 'biweekly')
      ? dayNameToIndex(weekDay)
      : null;

    const input = {
      label: label.trim() || undefined,
      cadence_type: dbCadence as 'weekly' | 'monthly' | 'quarterly' | 'custom',
      day_of_week: dayOfWeek,
      notification_time: timeStr,
      timezone: tz,
      first_question_preview: preview,
    };

    try {
      if (editing && id) {
        await updateSchedule.mutateAsync({ id, ...input });
      } else {
        await createSchedule.mutateAsync(input);
      }
      router.back();
    } catch {
      const msg = 'Failed to save schedule. Please try again.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    }
  };

  const isSaving = createSchedule.isPending || updateSchedule.isPending;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <FontAwesome name="times" size={16} color={colors.umber} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editing ? 'Edit schedule' : 'New schedule'}</Text>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveBtnText}>{isSaving ? '...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Label */}
        <Text style={styles.fieldLabel}>LABEL</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder="e.g. Weekly wins, Quarterly review"
          placeholderTextColor={colors.umber}
        />

        {/* Cadence pills */}
        <SectionLabel>Cadence</SectionLabel>
        <View style={styles.cadenceRow}>
          {CADENCES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.cadencePill, cadence === c && styles.cadencePillSelected]}
              onPress={() => setCadence(c)}
            >
              <Text style={[styles.cadencePillText, cadence === c && styles.cadencePillTextSelected]}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Day of week (weekly/biweekly) */}
        {(cadence === 'weekly' || cadence === 'biweekly') && (
          <>
            <SectionLabel>Day of week</SectionLabel>
            <View style={styles.dayRow}>
              {ALL_DAYS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dayPill, weekDay === d && styles.dayPillSelected]}
                  onPress={() => setWeekDay(d)}
                >
                  <Text style={[styles.dayPillText, weekDay === d && styles.dayPillTextSelected]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Quarterly: month in quarter */}
        {cadence === 'quarterly' && (
          <>
            <SectionLabel>Month in quarter</SectionLabel>
            <View style={styles.pillRow}>
              {Q_MONTHS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.cadencePill, qMonth === m && styles.cadencePillSelected]}
                  onPress={() => setQMonth(m)}
                >
                  <Text style={[styles.cadencePillText, qMonth === m && styles.cadencePillTextSelected]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Monthly/Quarterly: day selection */}
        {(cadence === 'monthly' || cadence === 'quarterly') && (
          <>
            <SectionLabel>Day selection</SectionLabel>
            {/* Mode toggle */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeBtn, monthMode === 'occurrence' && styles.modeBtnSelected]}
                onPress={() => setMonthMode('occurrence')}
              >
                <Text style={[styles.modeBtnText, monthMode === 'occurrence' && styles.modeBtnTextSelected]}>
                  Day of week
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, monthMode === 'date' && styles.modeBtnSelected]}
                onPress={() => setMonthMode('date')}
              >
                <Text style={[styles.modeBtnText, monthMode === 'date' && styles.modeBtnTextSelected]}>
                  Specific date
                </Text>
              </TouchableOpacity>
            </View>

            {monthMode === 'occurrence' && (
              <View style={styles.occurrenceSection}>
                <Text style={styles.subLabel}>Which occurrence</Text>
                <View style={styles.pillRow}>
                  {OCCURRENCES.map((o) => (
                    <TouchableOpacity
                      key={o}
                      style={[styles.smallPill, occurrence === o && styles.smallPillSelected]}
                      onPress={() => setOccurrence(o)}
                    >
                      <Text style={[styles.smallPillText, occurrence === o && styles.smallPillTextSelected]}>
                        {o}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={[styles.subLabel, { marginTop: 8 }]}>Day of week</Text>
                <View style={styles.dayRow}>
                  {ALL_DAYS.map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.dayPill, occDay === d && styles.dayPillSelected]}
                      onPress={() => setOccDay(d)}
                    >
                      <Text style={[styles.dayPillText, occDay === d && styles.dayPillTextSelected]}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {monthMode === 'date' && (
              <View style={styles.pillRow}>
                {SPECIFIC_DATES.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.cadencePill, specificDate === d && styles.cadencePillSelected]}
                    onPress={() => setSpecificDate(d)}
                  >
                    <Text style={[styles.cadencePillText, specificDate === d && styles.cadencePillTextSelected]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {/* Time */}
        <SectionLabel>Time</SectionLabel>
        <View style={styles.timeSection}>
          <Text style={styles.subLabel}>Hour</Text>
          <View style={styles.timePillsWrap}>
            {HOURS.map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.timePill, hour === h && styles.timePillSelected]}
                onPress={() => setHour(h)}
              >
                <Text style={[styles.timePillText, hour === h && styles.timePillTextSelected]}>
                  {h}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.subLabel, { marginTop: 10 }]}>Minute</Text>
          <View style={styles.timePillsWrap}>
            {MINUTES.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.timePill, minute === m && styles.timePillSelected]}
                onPress={() => setMinute(m)}
              >
                <Text style={[styles.timePillText, minute === m && styles.timePillTextSelected]}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.ampmRow}>
            {['AM', 'PM'].map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.ampmPill, ampm === v && styles.ampmPillSelected]}
                onPress={() => setAmpm(v)}
              >
                <Text style={[styles.ampmPillText, ampm === v && styles.ampmPillTextSelected]}>
                  {v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Timezone */}
        <SectionLabel>Time zone</SectionLabel>
        <TouchableOpacity
          style={styles.tzSelector}
          onPress={() => setTzOpen(!tzOpen)}
        >
          <Text style={styles.tzSelectorText}>
            {TIMEZONES.find((t) => t.value === tz)?.label || tz}
          </Text>
          <FontAwesome
            name={tzOpen ? 'chevron-up' : 'chevron-down'}
            size={11}
            color={colors.umber}
          />
        </TouchableOpacity>
        {tzOpen && (
          <View style={styles.tzContainer}>
            {TIMEZONES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.tzRow, tz === t.value && styles.tzRowSelected]}
                onPress={() => {
                  setTz(t.value);
                  setTzOpen(false);
                }}
              >
                <Text style={[styles.tzText, tz === t.value && styles.tzTextSelected]}>
                  {t.label}
                </Text>
                {tz === t.value && (
                  <FontAwesome name="check" size={12} color={colors.moss} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Notification preview */}
        <SectionLabel>Notification message</SectionLabel>
        <View style={styles.previewCard}>
          <View style={styles.previewRow}>
            <LinearGradient
              colors={[colors.mossDeep, colors.moss]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.previewIcon}
            >
              <FontAwesome name="star" size={10} color="white" />
            </LinearGradient>
            <View style={styles.previewContent}>
              <Text style={styles.previewApp}>Career Memory · now</Text>
              <Text style={styles.previewMsg}>{preview}</Text>
            </View>
          </View>
          {customPreview && (
            <TextInput
              style={styles.previewInput}
              value={preview}
              onChangeText={setPreview}
              multiline
              numberOfLines={2}
            />
          )}
        </View>
        <TouchableOpacity onPress={() => setCustomPreview((v) => !v)}>
          <Text style={styles.customizeLink}>
            {customPreview ? 'Use default message' : 'Customize message'}
          </Text>
        </TouchableOpacity>

        {/* Schedule summary */}
        <View style={styles.summaryBox}>
          <SectionLabel>Schedule summary</SectionLabel>
          <Text style={styles.summaryText}>{scheduleSummary}</Text>
        </View>
      </ScrollView>
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
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    color: colors.walnut,
  },
  saveBtn: {
    backgroundColor: colors.moss,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  saveBtnText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: colors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  fieldLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    letterSpacing: 0.8,
    color: colors.umber,
    marginBottom: 7,
  },
  input: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14.5,
    color: colors.walnut,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 18,
  },
  cadenceRow: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 20,
  },
  cadencePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  cadencePillSelected: {
    borderColor: colors.moss,
    backgroundColor: colors.moss,
  },
  cadencePillText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12.5,
    color: colors.walnut,
  },
  cadencePillTextSelected: {
    fontFamily: 'DMSans_500Medium',
    color: colors.white,
  },
  dayRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 20,
  },
  dayPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  dayPillSelected: {
    borderColor: colors.moss,
    backgroundColor: colors.moss,
  },
  dayPillText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: colors.walnut,
  },
  dayPillTextSelected: {
    fontFamily: 'DMSans_500Medium',
    color: colors.white,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.cardBorder,
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  modeBtnSelected: {
    backgroundColor: colors.card,
  },
  modeBtnText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12.5,
    color: colors.umber,
  },
  modeBtnTextSelected: {
    fontFamily: 'DMSans_500Medium',
    color: colors.walnut,
  },
  occurrenceSection: {
    marginBottom: 20,
  },
  subLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.umber,
    marginBottom: 6,
  },
  smallPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  smallPillSelected: {
    borderColor: colors.moss,
    backgroundColor: colors.moss,
  },
  smallPillText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12.5,
    color: colors.walnut,
  },
  smallPillTextSelected: {
    fontFamily: 'DMSans_500Medium',
    color: colors.white,
  },
  timeSection: {
    marginBottom: 16,
  },
  timePillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  timePill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  timePillSelected: {
    borderColor: colors.moss,
    backgroundColor: colors.moss,
  },
  timePillText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
  },
  timePillTextSelected: {
    color: colors.white,
    fontFamily: 'DMSans_500Medium',
  },
  ampmRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 10,
  },
  ampmPill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  ampmPillSelected: {
    borderColor: colors.moss,
    backgroundColor: colors.moss,
  },
  ampmPillText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.walnut,
  },
  ampmPillTextSelected: {
    color: colors.white,
    fontFamily: 'DMSans_500Medium',
  },
  tzSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
    marginBottom: 6,
  },
  tzSelectorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
  },
  tzContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    marginBottom: 18,
  },
  tzRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tzRowSelected: {
    backgroundColor: colors.mossFaint,
  },
  tzText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
  },
  tzTextSelected: {
    color: colors.moss,
    fontFamily: 'DMSans_500Medium',
  },
  previewCard: {
    backgroundColor: colors.card,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  previewIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContent: {
    flex: 1,
  },
  previewApp: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: colors.walnut,
    marginBottom: 2,
  },
  previewMsg: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12.5,
    color: colors.walnut,
    lineHeight: 17,
  },
  previewInput: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 9,
    padding: 12,
    marginTop: 12,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  customizeLink: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12.5,
    color: colors.moss,
    marginTop: 8,
    marginBottom: 18,
  },
  summaryBox: {
    backgroundColor: colors.mossFaint,
    borderWidth: 1,
    borderColor: colors.mossBorder,
    borderRadius: 12,
    padding: 14,
  },
  summaryText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.mossDeep,
    lineHeight: 21,
  },
});
