import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase, ensureAuthSession } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import { useCompanyMutations } from '@/hooks/useCompanyMutations';
import { useNotificationSchedules } from '@/hooks/useNotificationSchedules';
import { colors } from '@/constants/colors';

const STEPS = {
  WELCOME: 0,
  NAME: 1,
  COMPANY: 2,
  NOTIFICATIONS: 3,
  ALL_SET: 4,
} as const;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CADENCES = [
  { id: 'weekly', label: 'Weekly', sub: 'Once a week' },
  { id: 'biweekly', label: 'Biweekly', sub: 'Every two weeks' },
  { id: 'monthly', label: 'Monthly', sub: 'Once a month' },
] as const;

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

const HOURS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const MINUTES = ['00', '15', '30', '45'];

export default function OnboardingScreen() {
  const router = useRouter();
  const session = useUserStore((s) => s.session);
  const profile = useUserStore((s) => s.profile);
  const { createCompany } = useCompanyMutations();
  const { createSchedule } = useNotificationSchedules();

  const [step, setStep] = useState<number>(STEPS.WELCOME);
  const [saving, setSaving] = useState(false);

  // Step 1: Name
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Step 2: Company
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');

  // Step 3: Notifications
  const [cadence, setCadence] = useState<string>('weekly');
  const [dayOfWeek, setDayOfWeek] = useState('Fri');
  const [hour, setHour] = useState('5');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState('PM');
  const [tz, setTz] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'America/New_York';
    }
  });

  const goNext = () => setStep((s) => s + 1);
  const goBack = () => setStep((s) => s - 1);

  const completeOnboarding = async () => {
    try {
      const userId = await ensureAuthSession();
      await supabase
        .from('users')
        .update({ onboarding_complete: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      // Refresh profile in store
      useUserStore.setState({ profile: null });
      await useUserStore.getState().fetchProfile(userId);
    } catch (err) {
      console.warn('Failed to mark onboarding complete:', err);
    }
  };

  const handleSaveName = async () => {
    if (!firstName.trim()) return;
    setSaving(true);
    try {
      const userId = await ensureAuthSession();
      await supabase
        .from('users')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
      goNext();
    } catch (err) {
      console.error('Failed to save name:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCompany = async () => {
    if (!companyName.trim()) {
      goNext();
      return;
    }
    setSaving(true);
    try {
      await createCompany.mutateAsync({
        name: companyName.trim(),
        role_title: roleTitle.trim(),
        start_date: new Date().toISOString().split('T')[0],
        is_current: true,
      });

      // Also set default_role_title on user
      if (roleTitle.trim()) {
        const userId = await ensureAuthSession();
        await supabase
          .from('users')
          .update({ default_role_title: roleTitle.trim() })
          .eq('user_id', userId);
      }
      goNext();
    } catch (err) {
      console.error('Failed to save company:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotification = async () => {
    setSaving(true);
    try {
      const dayIndex = DAYS.indexOf(dayOfWeek);
      let hourNum = parseInt(hour, 10);
      if (ampm === 'PM' && hourNum !== 12) hourNum += 12;
      if (ampm === 'AM' && hourNum === 12) hourNum = 0;
      const timeStr = `${String(hourNum).padStart(2, '0')}:${minute}`;

      const dbCadence = cadence === 'biweekly' ? 'custom' : cadence;

      await createSchedule.mutateAsync({
        label: cadence === 'weekly' ? 'Weekly check-in' : cadence === 'biweekly' ? 'Biweekly check-in' : 'Monthly check-in',
        cadence_type: dbCadence as 'weekly' | 'monthly' | 'quarterly' | 'custom',
        day_of_week: (cadence === 'weekly' || cadence === 'biweekly') ? dayIndex : null,
        notification_time: timeStr,
        timezone: tz,
        is_active: true,
      });
      goNext();
    } catch (err) {
      console.error('Failed to save notification:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFinishToApp = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const handleFinishToEntry = async () => {
    await completeOnboarding();
    router.replace('/entry/new');
  };

  const tzLabel = TIMEZONES.find((t) => t.value === tz)?.label || tz;

  // ─── Render Steps ─────────────────────────────────────────────────────

  if (step === STEPS.WELCOME) {
    return (
      <LinearGradient
        colors={['#3A5232', '#4A6642', '#5C7A52']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.welcomeContainer}
      >
        <SafeAreaView style={styles.welcomeInner} edges={['top', 'bottom']}>
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeIcon}>
              <FontAwesome name="star" size={32} color="white" />
            </View>
            <Text style={styles.welcomeTitle}>
              {'Your career,\nfinally remembered.'}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Capture what you accomplish as it happens. Use it when it counts — for reviews, resumes, and job searches.
            </Text>
          </View>

          <View style={styles.welcomeFeatures}>
            {[
              { emoji: '\uD83C\uDFA4', text: 'Voice-first capture — done in 60 seconds' },
              { emoji: '\u2728', text: 'AI turns your words into polished bullets' },
              { emoji: '\uD83D\uDCCB', text: 'Resume-ready when you need it' },
            ].map((feature, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureEmoji}>{feature.emoji}</Text>
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.welcomeButtons}>
            <TouchableOpacity style={styles.getStartedBtn} onPress={goNext}>
              <Text style={styles.getStartedText}>Get started</Text>
            </TouchableOpacity>
            {!session && (
              <TouchableOpacity
                style={styles.hasAccountBtn}
                onPress={() => router.replace('/(auth)/sign-in')}
              >
                <Text style={styles.hasAccountText}>I already have an account</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (step === STEPS.NAME) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.stepHeader}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <FontAwesome name="chevron-left" size={14} color={colors.walnut} />
          </TouchableOpacity>
          <ProgressDots total={4} current={0} />
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.stepBody} contentContainerStyle={styles.stepBodyContent} keyboardShouldPersistTaps="handled">
          <View style={styles.stepIconBox}>
            <Text style={{ fontSize: 22 }}>{'\uD83D\uDC4B'}</Text>
          </View>
          <Text style={styles.stepTitle}>What should we call you?</Text>
          <Text style={styles.stepSubtitle}>
            Your name will appear in your greeting and on any exports.
          </Text>

          <Text style={styles.fieldLabel}>FIRST NAME *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Jordan"
            placeholderTextColor={colors.umber}
            value={firstName}
            onChangeText={setFirstName}
            autoFocus
          />

          <Text style={styles.fieldLabel}>LAST NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Rivera"
            placeholderTextColor={colors.umber}
            value={lastName}
            onChangeText={setLastName}
          />
          <Text style={styles.fieldHint}>Optional — used on resume exports.</Text>
        </ScrollView>

        <View style={styles.stepFooter}>
          <TouchableOpacity
            style={[styles.primaryBtn, !firstName.trim() && styles.primaryBtnDisabled]}
            onPress={handleSaveName}
            disabled={!firstName.trim() || saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryBtnText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === STEPS.COMPANY) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.stepHeader}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <FontAwesome name="chevron-left" size={14} color={colors.walnut} />
          </TouchableOpacity>
          <ProgressDots total={4} current={1} />
          <TouchableOpacity onPress={goNext}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.stepBody} contentContainerStyle={styles.stepBodyContent} keyboardShouldPersistTaps="handled">
          <View style={styles.stepIconBox}>
            <FontAwesome name="building-o" size={22} color={colors.moss} />
          </View>
          <Text style={styles.stepTitle}>Where are you working?</Text>
          <Text style={styles.stepSubtitle}>
            This gets attached to your achievements automatically. Skip if you're between roles — you can add this later.
          </Text>

          <Text style={styles.fieldLabel}>COMPANY</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Acme Corp"
            placeholderTextColor={colors.umber}
            value={companyName}
            onChangeText={setCompanyName}
            autoFocus
          />

          <Text style={styles.fieldLabel}>ROLE TITLE</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Senior Product Manager"
            placeholderTextColor={colors.umber}
            value={roleTitle}
            onChangeText={setRoleTitle}
          />
          <Text style={styles.fieldHint}>
            This defaults onto new achievements and can be overridden per entry.
          </Text>
        </ScrollView>

        <View style={styles.stepFooter}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleSaveCompany}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryBtnText}>Next</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === STEPS.NOTIFICATIONS) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.stepHeader}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <FontAwesome name="chevron-left" size={14} color={colors.walnut} />
          </TouchableOpacity>
          <ProgressDots total={4} current={2} />
          <TouchableOpacity onPress={goNext}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.stepBody} contentContainerStyle={styles.stepBodyContent}>
          <View style={styles.stepIconBox}>
            <FontAwesome name="bell-o" size={22} color={colors.moss} />
          </View>
          <Text style={styles.stepTitle}>When should we check in?</Text>
          <Text style={styles.stepSubtitle}>
            A gentle nudge at the right time is how the habit sticks.
          </Text>

          {/* Cadence */}
          <Text style={styles.sectionLabel}>CADENCE</Text>
          <View style={{ gap: 8, marginBottom: 20 }}>
            {CADENCES.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.cadenceCard,
                  cadence === c.id && styles.cadenceCardSelected,
                ]}
                onPress={() => setCadence(c.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.cadenceLabel,
                      cadence === c.id && styles.cadenceLabelSelected,
                    ]}
                  >
                    {c.label}
                  </Text>
                  <Text style={styles.cadenceSub}>{c.sub}</Text>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    cadence === c.id && styles.radioOuterSelected,
                  ]}
                >
                  {cadence === c.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Day picker */}
          {(cadence === 'weekly' || cadence === 'biweekly') && (
            <>
              <Text style={styles.sectionLabel}>DAY</Text>
              <View style={styles.dayRow}>
                {DAYS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.dayPill, dayOfWeek === d && styles.dayPillSelected]}
                    onPress={() => setDayOfWeek(d)}
                  >
                    <Text
                      style={[
                        styles.dayPillText,
                        dayOfWeek === d && styles.dayPillTextSelected,
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Time */}
          <Text style={styles.sectionLabel}>TIME</Text>
          <View style={styles.timeContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.timeRow}>
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
            </ScrollView>
            <View style={styles.timeRow}>
              {MINUTES.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.timePill, minute === m && styles.timePillSelected]}
                  onPress={() => setMinute(m)}
                >
                  <Text style={[styles.timePillText, minute === m && styles.timePillTextSelected]}>
                    :{m}
                  </Text>
                </TouchableOpacity>
              ))}
              <View style={{ width: 8 }} />
              {(['AM', 'PM'] as const).map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[styles.timePill, ampm === a && styles.timePillSelected]}
                  onPress={() => setAmpm(a)}
                >
                  <Text style={[styles.timePillText, ampm === a && styles.timePillTextSelected]}>
                    {a}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Timezone */}
          <Text style={styles.sectionLabel}>TIME ZONE</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16 }}
          >
            <View style={styles.tzRow}>
              {TIMEZONES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.tzPill, tz === t.value && styles.tzPillSelected]}
                  onPress={() => setTz(t.value)}
                >
                  <Text
                    style={[styles.tzPillText, tz === t.value && styles.tzPillTextSelected]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Preview */}
          <View style={styles.previewCard}>
            <Text style={styles.sectionLabel}>PREVIEW</Text>
            <View style={styles.previewRow}>
              <LinearGradient
                colors={[colors.mossDeep, colors.moss]}
                style={styles.previewIcon}
              >
                <FontAwesome name="star" size={13} color="white" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.previewAppName}>Career Memory · now</Text>
                <Text style={styles.previewMsg}>What did you accomplish this week? {'\uD83C\uDFAF'}</Text>
              </View>
            </View>
          </View>

          {/* Summary */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>
              Every {cadence === 'weekly' ? dayOfWeek : cadence === 'biweekly' ? `other ${dayOfWeek}` : 'month'} at {hour}:{minute} {ampm} · {tzLabel}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.stepFooter}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleSaveNotification}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryBtnText}>Set reminder</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === STEPS.ALL_SET) {
    const displayName = firstName || profile?.first_name || '';
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.allSetContent}>
          <LinearGradient
            colors={[colors.mossDeep, colors.moss]}
            style={styles.allSetIcon}
          >
            <FontAwesome name="check" size={32} color="white" />
          </LinearGradient>
          <Text style={styles.allSetTitle}>
            You're all set{displayName ? `, ${displayName}` : ''}!
          </Text>
          <Text style={styles.allSetSubtitle}>
            Your career memory is ready. Start logging — even a single sentence about something you did today is worth capturing.
          </Text>

          <View style={styles.allSetFeatures}>
            {[
              { emoji: '\uD83C\uDFA4', title: 'Log an achievement', sub: 'Voice or text, takes about a minute' },
              { emoji: '\u2728', title: 'AI does the work', sub: 'Synthesizes your words into polished bullets' },
              { emoji: '\uD83D\uDCCB', title: 'Use it when it counts', sub: 'Resume-ready in your Summary tab' },
            ].map((item, i) => (
              <View key={i} style={styles.allSetFeatureCard}>
                <View style={styles.allSetFeatureIcon}>
                  <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.allSetFeatureTitle}>{item.title}</Text>
                  <Text style={styles.allSetFeatureSub}>{item.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.stepFooter}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleFinishToEntry}>
            <Text style={styles.primaryBtnText}>{'Log my first achievement \u2192'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleFinishToApp}>
            <Text style={styles.secondaryBtnText}>Take me to the app first</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }


  return null;
}

// ─── Progress Dots ──────────────────────────────────────────────────────────

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current && styles.dotActive,
            i < current && styles.dotComplete,
          ]}
        />
      ))}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Welcome
  welcomeContainer: {
    flex: 1,
  },
  welcomeInner: {
    flex: 1,
    justifyContent: 'space-between',
  },
  welcomeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  welcomeIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  welcomeTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 34,
    color: 'white',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  welcomeSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    lineHeight: 25,
  },
  welcomeFeatures: {
    paddingHorizontal: 28,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureEmoji: {
    fontSize: 16,
  },
  featureText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 19,
    flex: 1,
  },
  welcomeButtons: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  getStartedBtn: {
    backgroundColor: 'white',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  getStartedText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: colors.mossDeep,
  },
  hasAccountBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  hasAccountText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },

  // Common step layout
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    padding: 4,
  },
  skipText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.umber,
  },
  stepBody: {
    flex: 1,
  },
  stepBodyContent: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 20,
  },
  stepIconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.mossFaint,
    borderWidth: 1.5,
    borderColor: colors.mossBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  stepTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 26,
    color: colors.walnut,
    lineHeight: 31,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.umber,
    lineHeight: 22,
    marginBottom: 32,
  },
  stepFooter: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  primaryBtn: {
    backgroundColor: colors.moss,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: 'rgba(173,156,142,0.3)',
  },
  primaryBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: colors.white,
  },
  secondaryBtn: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13.5,
    color: colors.umber,
  },

  // Fields
  fieldLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    letterSpacing: 0.8,
    color: colors.umber,
    marginBottom: 7,
  },
  input: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.walnut,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
  },
  fieldHint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.umber,
    marginTop: -6,
    marginBottom: 14,
  },

  // Section labels
  sectionLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.umber,
    marginBottom: 8,
  },

  // Cadence cards
  cadenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: 13,
    padding: 12,
    paddingHorizontal: 16,
  },
  cadenceCardSelected: {
    backgroundColor: colors.mossFaint,
    borderColor: colors.moss,
  },
  cadenceLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.walnut,
  },
  cadenceLabelSelected: {
    fontFamily: 'DMSans_500Medium',
    color: colors.moss,
  },
  cadenceSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.umber,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.moss,
    backgroundColor: colors.moss,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },

  // Day picker
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
    color: 'white',
  },

  // Time picker
  timeContainer: {
    gap: 8,
    marginBottom: 20,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  timePill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
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
    fontFamily: 'DMSans_500Medium',
    color: 'white',
  },

  // Timezone
  tzRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  tzPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  tzPillSelected: {
    borderColor: colors.moss,
    backgroundColor: colors.moss,
  },
  tzPillText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.walnut,
  },
  tzPillTextSelected: {
    fontFamily: 'DMSans_500Medium',
    color: 'white',
  },

  // Notification preview
  previewCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 13,
    padding: 13,
    marginBottom: 8,
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
  previewAppName: {
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
  summaryBox: {
    backgroundColor: colors.mossFaint,
    borderWidth: 1,
    borderColor: colors.mossBorder,
    borderRadius: 11,
    padding: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  summaryText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12.5,
    color: colors.mossDeep,
    lineHeight: 19,
  },

  // All Set
  allSetContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  allSetIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  allSetTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 28,
    color: colors.walnut,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 12,
  },
  allSetSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14.5,
    color: colors.umber,
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 32,
  },
  allSetFeatures: {
    width: '100%',
    gap: 10,
  },
  allSetFeatureCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 13,
    padding: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  allSetFeatureIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.mossFaint,
    borderWidth: 1,
    borderColor: colors.mossBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allSetFeatureTitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13.5,
    color: colors.walnut,
  },
  allSetFeatureSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.umber,
    marginTop: 2,
  },

  // Progress dots
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cardBorder,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.moss,
  },
  dotComplete: {
    backgroundColor: colors.moss,
  },
});
