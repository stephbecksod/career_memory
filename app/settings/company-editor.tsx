import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useCompanies } from '@/hooks/useCompanies';
import { useCompanyMutations } from '@/hooks/useCompanyMutations';
import { colors } from '@/constants/colors';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = Array.from({ length: 15 }, (_, i) => String(2026 - i));

function parseMonthYear(dateStr: string | null): { month: string; year: string } {
  if (!dateStr) return { month: '', year: '' };
  // Parse directly from "YYYY-MM-DD" string to avoid timezone offset issues
  const parts = dateStr.split('-');
  if (parts.length < 2) return { month: '', year: '' };
  const monthIdx = parseInt(parts[1], 10) - 1;
  return { month: MONTHS[monthIdx] ?? '', year: parts[0] };
}

function toDateString(month: string, year: string): string | null {
  if (!month || !year) return null;
  const monthIdx = MONTHS.indexOf(month);
  if (monthIdx === -1) return null;
  return `${year}-${String(monthIdx + 1).padStart(2, '0')}-01`;
}

export default function CompanyEditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: companies } = useCompanies();
  const { createCompany, updateCompany, deleteCompany } = useCompanyMutations();
  const editing = !!id;

  const existingCompany = companies?.find((c) => c.company_id === id);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [startYear, setStartYear] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [endMonth, setEndMonth] = useState('');
  const [endYear, setEndYear] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (existingCompany && !initialized) {
      setName(existingCompany.name);
      setRole(existingCompany.role_title || '');
      const start = parseMonthYear(existingCompany.start_date);
      setStartMonth(start.month);
      setStartYear(start.year);
      setIsCurrent(existingCompany.is_current);
      if (existingCompany.end_date) {
        const end = parseMonthYear(existingCompany.end_date);
        setEndMonth(end.month);
        setEndYear(end.year);
      }
      setInitialized(true);
    }
  }, [existingCompany, initialized]);

  const canSave = name.trim() && startMonth && startYear;

  // Validate end date is after start date
  const endDateStr = toDateString(endMonth, endYear);
  const startDateStr = toDateString(startMonth, startYear);
  const hasEndDateError = endDateStr && startDateStr && endDateStr < startDateStr;

  const handleSave = async () => {
    if (!canSave) return;

    if (hasEndDateError) return;

    const input = {
      name: name.trim(),
      role_title: role.trim() || undefined,
      start_date: toDateString(startMonth, startYear),
      end_date: toDateString(endMonth, endYear),
      is_current: isCurrent,
    };

    try {
      if (editing && id) {
        await updateCompany.mutateAsync({ id, ...input });
      } else {
        await createCompany.mutateAsync(input);
      }
      router.back();
    } catch {
      const msg = 'Failed to save company. Please try again.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteCompany.mutateAsync(id);
      router.back();
    } catch {
      // Error handled
    }
  };

  const isSaving = createCompany.isPending || updateCompany.isPending;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <FontAwesome name="times" size={16} color={colors.umber} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editing ? 'Edit company' : 'Add company'}</Text>
        <TouchableOpacity
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!canSave || !!hasEndDateError || isSaving}
        >
          <Text style={[styles.saveBtnText, !canSave && styles.saveBtnTextDisabled]}>
            {isSaving ? '...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Company name */}
        <Text style={styles.fieldLabel}>
          COMPANY NAME <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Acme Corp"
          placeholderTextColor={colors.umber}
        />

        {/* Role title */}
        <Text style={styles.fieldLabel}>ROLE TITLE</Text>
        <TextInput
          style={styles.input}
          value={role}
          onChangeText={setRole}
          placeholder="e.g. Senior Product Manager"
          placeholderTextColor={colors.umber}
        />
        <Text style={styles.hint}>Used as the default role on new achievements.</Text>

        {/* Start date */}
        <SectionLabel style={{ marginTop: 8 }}>
          {'Start date *'}
        </SectionLabel>
        <View style={styles.dateRow}>
          <View style={styles.dateCol}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
              <View style={styles.pillRow}>
                {MONTHS.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.pill, startMonth === m && styles.pillSelected]}
                    onPress={() => setStartMonth(m)}
                  >
                    <Text style={[styles.pillText, startMonth === m && styles.pillTextSelected]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
          <View style={styles.dateCol}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
              <View style={styles.pillRow}>
                {YEARS.map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[styles.pill, startYear === y && styles.pillSelected]}
                    onPress={() => setStartYear(y)}
                  >
                    <Text style={[styles.pillText, startYear === y && styles.pillTextSelected]}>
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Current employer toggle */}
        <View style={styles.toggleCard}>
          <View>
            <Text style={styles.toggleLabel}>Current employer</Text>
            <Text style={styles.toggleSub}>Marks this as your active role</Text>
          </View>
          <Switch
            value={isCurrent}
            onValueChange={setIsCurrent}
            trackColor={{ false: colors.blush, true: colors.moss }}
            thumbColor={colors.white}
          />
        </View>

        {/* End date */}
        <SectionLabel>End date</SectionLabel>
        <View style={styles.dateRow}>
          <View style={styles.dateCol}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
              <View style={styles.pillRow}>
                {MONTHS.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.pill, endMonth === m && styles.pillSelected]}
                    onPress={() => setEndMonth(endMonth === m ? '' : m)}
                  >
                    <Text style={[styles.pillText, endMonth === m && styles.pillTextSelected]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
          <View style={styles.dateCol}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
              <View style={styles.pillRow}>
                {YEARS.map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[styles.pill, endYear === y && styles.pillSelected]}
                    onPress={() => setEndYear(endYear === y ? '' : y)}
                  >
                    <Text style={[styles.pillText, endYear === y && styles.pillTextSelected]}>
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
        {!endMonth && !endYear && (
          <Text style={styles.hint}>Leave blank if still in this role or no specific end date.</Text>
        )}
        {hasEndDateError && (
          <Text style={[styles.hint, { color: colors.danger }]}>End date must be after start date.</Text>
        )}

        {/* Delete (edit only) */}
        {editing && !showDeleteConfirm && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => setShowDeleteConfirm(true)}
          >
            <FontAwesome name="trash-o" size={14} color={colors.danger} />
            <Text style={styles.deleteBtnText}>Remove company</Text>
          </TouchableOpacity>
        )}

        {showDeleteConfirm && (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>
              This will remove the company. Achievements linked to it won't be deleted.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.confirmCancel}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmDelete} onPress={handleDelete}>
                <Text style={styles.confirmDeleteText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  saveBtnDisabled: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  saveBtnText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: colors.white,
  },
  saveBtnTextDisabled: {
    color: colors.umber,
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
  required: {
    color: colors.danger,
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
    marginBottom: 14,
  },
  hint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11.5,
    color: colors.umber,
    lineHeight: 17,
    marginTop: -8,
    marginBottom: 14,
  },
  dateRow: {
    gap: 8,
    marginBottom: 18,
  },
  dateCol: {},
  pillScroll: {
    marginBottom: 6,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  pillSelected: {
    borderColor: colors.moss,
    backgroundColor: colors.moss,
  },
  pillText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.walnut,
  },
  pillTextSelected: {
    color: colors.white,
    fontFamily: 'DMSans_500Medium',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 13,
    padding: 16,
    marginBottom: 18,
  },
  toggleLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.walnut,
  },
  toggleSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11.5,
    color: colors.umber,
    marginTop: 1,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerFaint,
    marginTop: 10,
  },
  deleteBtnText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.danger,
  },
  confirmBox: {
    backgroundColor: colors.dangerFaint,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 13,
    padding: 16,
    marginTop: 10,
  },
  confirmText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13.5,
    color: colors.danger,
    lineHeight: 21,
    marginBottom: 14,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmCancel: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
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
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.danger,
    alignItems: 'center',
  },
  confirmDeleteText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.white,
  },
});
