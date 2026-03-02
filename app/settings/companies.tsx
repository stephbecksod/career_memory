import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/BackButton';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { useCompanies } from '@/hooks/useCompanies';
import { useCompanyMutations } from '@/hooks/useCompanyMutations';
import { colors } from '@/constants/colors';
import type { Company } from '@/types/database';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function CompaniesScreen() {
  const router = useRouter();
  const { data: companies, isLoading } = useCompanies();
  const { deleteCompany } = useCompanyMutations();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (company: Company) => {
    try {
      await deleteCompany.mutateAsync(company.company_id);
      setConfirmDeleteId(null);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Companies</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/settings/company-editor')}
        >
          <FontAwesome name="plus" size={12} color={colors.moss} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <SectionLabel>Your companies</SectionLabel>

          {companies?.map((company) => (
            <View key={company.company_id}>
              <View style={[styles.card, company.is_current && styles.cardCurrent]}>
                {/* Top accent */}
                <View
                  style={[
                    styles.topAccent,
                    { backgroundColor: company.is_current ? colors.moss : colors.blush },
                    { opacity: company.is_current ? 0.7 : 0.4 },
                  ]}
                />

                <View style={styles.cardContent}>
                  <View style={styles.cardMain}>
                    <View style={styles.nameRow}>
                      <Text style={styles.companyName}>{company.name}</Text>
                      {company.is_current && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>Current</Text>
                        </View>
                      )}
                    </View>
                    {company.role_title && (
                      <Text style={styles.roleText}>{company.role_title}</Text>
                    )}
                    <Text style={styles.dateText}>
                      {formatDate(company.start_date)} — {company.end_date ? formatDate(company.end_date) : 'Present'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => router.push(`/settings/company-editor?id=${company.company_id}`)}
                  >
                    <FontAwesome name="pencil" size={12} color={colors.umber} />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                {/* Delete row */}
                <View style={styles.deleteRow}>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => setConfirmDeleteId(company.company_id)}
                  >
                    <FontAwesome name="trash-o" size={13} color={colors.danger} />
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Inline delete confirm */}
              {confirmDeleteId === company.company_id && (
                <View style={styles.confirmBox}>
                  <Text style={styles.confirmText}>
                    Remove "{company.name}"? Your achievements won't be deleted.
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
                      onPress={() => handleDelete(company)}
                    >
                      <Text style={styles.confirmDeleteText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}

          <Text style={styles.infoText}>
            Achievements are linked to companies at the time of logging. Removing a company won't affect your existing entries.
          </Text>
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 9,
    overflow: 'hidden',
    position: 'relative',
  },
  cardCurrent: {
    borderColor: colors.mossBorder,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 18,
  },
  cardMain: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 2,
  },
  companyName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: colors.walnut,
  },
  currentBadge: {
    backgroundColor: colors.mossFaint,
    borderWidth: 1,
    borderColor: colors.mossBorder,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  currentBadgeText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: colors.moss,
  },
  roleText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
    marginTop: 2,
  },
  dateText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11.5,
    color: colors.umber,
    marginTop: 3,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  editBtnText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.umber,
  },
  deleteRow: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  removeBtnText: {
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
  infoText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.umber,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 16,
  },
});
