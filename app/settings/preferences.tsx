import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/BackButton';
import { usePreferences } from '@/hooks/usePreferences';
import { PREFERENCE_KEY } from '@/constants/app';
import { colors } from '@/constants/colors';

const RETENTION_STEPS = [7, 14, 21, 30, 45, 60, 90];

const SYNTH_OPTIONS = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'bullets', label: 'Bullets' },
  { value: 'star', label: 'STAR only' },
  { value: 'all', label: 'All three' },
];

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export default function PreferencesScreen() {
  const router = useRouter();
  const { data: prefs, isLoading, setPreference } = usePreferences();

  const [synthFormat, setSynthFormat] = useState('all');
  const [theme, setTheme] = useState('system');
  const [notifSound, setNotifSound] = useState(true);
  const [audioRetention, setAudioRetention] = useState(30);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prefs) {
      setSynthFormat(prefs[PREFERENCE_KEY.SYNTHESIS_FORMAT] || 'all');
      setTheme(prefs[PREFERENCE_KEY.THEME] || 'system');
      setNotifSound(prefs[PREFERENCE_KEY.NOTIFICATION_SOUND] !== 'false');
      setAudioRetention(
        prefs[PREFERENCE_KEY.AUDIO_RETENTION_DAYS]
          ? parseInt(prefs[PREFERENCE_KEY.AUDIO_RETENTION_DAYS], 10)
          : 30
      );
    }
  }, [prefs]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        setPreference.mutateAsync({ key: PREFERENCE_KEY.SYNTHESIS_FORMAT, value: synthFormat }),
        setPreference.mutateAsync({ key: PREFERENCE_KEY.THEME, value: theme }),
        setPreference.mutateAsync({ key: PREFERENCE_KEY.NOTIFICATION_SOUND, value: String(notifSound) }),
        setPreference.mutateAsync({ key: PREFERENCE_KEY.AUDIO_RETENTION_DAYS, value: String(audioRetention) }),
      ]);
      const msg = 'Preferences saved.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Saved', msg);
      }
    } catch {
      const msg = 'Failed to save preferences. Please try again.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Preferences</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Synthesis format */}
        <Text style={styles.sectionLabel}>SYNTHESIS FORMAT</Text>
        <View style={styles.grid2x2}>
          {SYNTH_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.gridBtn, synthFormat === opt.value && styles.gridBtnSelected]}
              onPress={() => setSynthFormat(opt.value)}
            >
              <Text
                style={[styles.gridBtnText, synthFormat === opt.value && styles.gridBtnTextSelected]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Theme */}
        <Text style={styles.sectionLabel}>THEME</Text>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.themeBtn, theme === opt.value && styles.themeBtnSelected]}
              onPress={() => setTheme(opt.value)}
            >
              <Text
                style={[styles.themeBtnText, theme === opt.value && styles.themeBtnTextSelected]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notification sound */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Notification sound</Text>
            <Text style={styles.toggleSub}>Play a sound when a reminder fires</Text>
          </View>
          <Switch
            value={notifSound}
            onValueChange={setNotifSound}
            trackColor={{ false: colors.blush, true: colors.moss }}
            thumbColor={colors.white}
          />
        </View>

        {/* Audio retention */}
        <Text style={styles.sectionLabel}>AUDIO RETENTION</Text>
        <View style={styles.sliderCard}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Keep audio files for</Text>
            <Text style={styles.sliderValue}>{audioRetention} days</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.retentionRow}>
              {RETENTION_STEPS.map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.retentionPill,
                    audioRetention === days && styles.retentionPillSelected,
                  ]}
                  onPress={() => setAudioRetention(days)}
                >
                  <Text
                    style={[
                      styles.retentionPillText,
                      audioRetention === days && styles.retentionPillTextSelected,
                    ]}
                  >
                    {days}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
        <Text style={styles.sliderHint}>
          Audio is automatically deleted after this period. Your transcribed text is always kept.
        </Text>

        {/* Save button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save preferences'}
          </Text>
        </TouchableOpacity>
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
    gap: 10,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: colors.walnut,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.umber,
    marginBottom: 8,
  },
  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  gridBtn: {
    width: '48%',
    paddingVertical: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  gridBtnSelected: {
    borderColor: colors.moss,
    backgroundColor: colors.moss,
  },
  gridBtnText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12.5,
    color: colors.umber,
  },
  gridBtnTextSelected: {
    fontFamily: 'DMSans_500Medium',
    color: colors.white,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  themeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  themeBtnSelected: {
    borderColor: colors.moss,
    backgroundColor: colors.moss,
  },
  themeBtnText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.umber,
  },
  themeBtnTextSelected: {
    fontFamily: 'DMSans_500Medium',
    color: colors.white,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 13,
    padding: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 18,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13.5,
    color: colors.walnut,
  },
  toggleSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.umber,
    marginTop: 2,
  },
  sliderCard: {
    backgroundColor: colors.card,
    borderRadius: 13,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sliderLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
  },
  sliderValue: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.moss,
  },
  retentionRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  retentionPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    backgroundColor: colors.bg,
  },
  retentionPillSelected: {
    borderColor: colors.moss,
    backgroundColor: colors.moss,
  },
  retentionPillText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
  },
  retentionPillTextSelected: {
    fontFamily: 'DMSans_500Medium',
    color: colors.white,
  },
  sliderHint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.umber,
    lineHeight: 17,
    marginTop: 6,
    marginBottom: 18,
  },
  saveButton: {
    backgroundColor: colors.moss,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.white,
  },
});
