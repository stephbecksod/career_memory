import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BackButton } from '@/components/ui/BackButton';
import { usePreferences } from '@/hooks/usePreferences';
import { PREFERENCE_KEY } from '@/constants/app';
import { colors } from '@/constants/colors';

const SYNTH_OPTIONS = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'bullets', label: 'Bullets' },
  { value: 'star', label: 'STAR only' },
  { value: 'all', label: 'All three' },
];

export default function PreferencesScreen() {
  const router = useRouter();
  const { data: prefs, isLoading, setPreference } = usePreferences();

  const [synthFormat, setSynthFormat] = useState('all');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prefs) {
      setSynthFormat(prefs[PREFERENCE_KEY.SYNTHESIS_FORMAT] || 'all');
    }
  }, [prefs]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setPreference.mutateAsync({ key: PREFERENCE_KEY.SYNTHESIS_FORMAT, value: synthFormat });
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

        {/* Audio retention — static notice */}
        <Text style={styles.sectionLabel}>AUDIO FILES</Text>
        <View style={styles.infoCard}>
          <FontAwesome name="info-circle" size={14} color={colors.moss} style={{ marginTop: 1 }} />
          <Text style={styles.infoText}>
            Audio recordings are automatically deleted after 15 days. Your transcribed text is always kept.
          </Text>
        </View>

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
    width: '48%' as any,
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
  infoCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.mossFaint,
    borderWidth: 1,
    borderColor: colors.mossBorder,
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },
  infoText: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 12.5,
    color: colors.mossDeep,
    lineHeight: 19,
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
