import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/BackButton';
import { useUserStore } from '@/stores/userStore';
import { useCompanies } from '@/hooks/useCompanies';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { colors } from '@/constants/colors';

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

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const { currentCompany } = useCompanies();
  const updateProfile = useUpdateProfile();

  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [roleTitle, setRoleTitle] = useState(profile?.default_role_title || '');
  const [timezone, setTimezone] = useState(profile?.timezone || 'America/Los_Angeles');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setRoleTitle(profile.default_role_title || '');
      setTimezone(profile.timezone || 'America/Los_Angeles');
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        first_name: firstName.trim(),
        last_name: lastName.trim() || undefined,
        default_role_title: roleTitle.trim() || undefined,
        timezone,
      });
      const msg = 'Profile updated successfully.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Saved', msg);
      }
    } catch {
      const msg = 'Failed to update profile. Please try again.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    }
  };

  const initial = firstName?.charAt(0)?.toUpperCase() || '?';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={[colors.moss, colors.mossDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </LinearGradient>
          <TouchableOpacity>
            <Text style={styles.changePhotoText}>Change photo</Text>
          </TouchableOpacity>
        </View>

        {/* Fields */}
        <View style={styles.fields}>
          <View>
            <Text style={styles.fieldLabel}>FIRST NAME</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor={colors.umber}
            />
          </View>

          <View>
            <Text style={styles.fieldLabel}>LAST NAME</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor={colors.umber}
            />
          </View>

          <View>
            <Text style={styles.fieldLabel}>EMAIL</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>{profile?.email}</Text>
            </View>
          </View>

          <View>
            <Text style={styles.fieldLabel}>CURRENT COMPANY</Text>
            <View style={styles.companyField}>
              <Text style={styles.readOnlyText}>
                {currentCompany?.name || 'None'}
              </Text>
              {currentCompany && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Current</Text>
                </View>
              )}
            </View>
          </View>

          <View>
            <Text style={styles.fieldLabel}>DEFAULT ROLE TITLE</Text>
            <TextInput
              style={styles.input}
              value={roleTitle}
              onChangeText={setRoleTitle}
              placeholder="e.g. Senior Software Engineer"
              placeholderTextColor={colors.umber}
            />
          </View>

          <View>
            <Text style={styles.fieldLabel}>TIMEZONE</Text>
            <View style={styles.pickerContainer}>
              {TIMEZONES.map((tz) => (
                <TouchableOpacity
                  key={tz.value}
                  style={[
                    styles.tzOption,
                    timezone === tz.value && styles.tzOptionSelected,
                  ]}
                  onPress={() => setTimezone(tz.value)}
                >
                  <Text
                    style={[
                      styles.tzOptionText,
                      timezone === tz.value && styles.tzOptionTextSelected,
                    ]}
                  >
                    {tz.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={updateProfile.isPending}
          >
            <Text style={styles.saveButtonText}>
              {updateProfile.isPending ? 'Saving...' : 'Save changes'}
            </Text>
          </TouchableOpacity>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 22,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 28,
    color: colors.white,
  },
  changePhotoText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: colors.moss,
  },
  fields: {
    gap: 14,
  },
  fieldLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.umber,
    marginBottom: 6,
  },
  input: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  readOnlyField: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  readOnlyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
  },
  companyField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  currentBadge: {
    backgroundColor: colors.mossFaint,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  currentBadgeText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10.5,
    color: colors.moss,
  },
  pickerContainer: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tzOption: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tzOptionSelected: {
    backgroundColor: colors.mossFaint,
  },
  tzOptionText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
  },
  tzOptionTextSelected: {
    color: colors.moss,
    fontFamily: 'DMSans_500Medium',
  },
  saveButton: {
    backgroundColor: colors.moss,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.white,
  },
});
