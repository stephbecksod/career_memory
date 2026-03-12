import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/stores/userStore';
import { useCompanies } from '@/hooks/useCompanies';
import { supabase, ensureAuthSession } from '@/lib/supabase';
import { colors } from '@/constants/colors';

export default function SettingsIndex() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { profile, clear } = useUserStore();
  const { currentCompany } = useCompanies();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    clear();
    router.replace('/(auth)/sign-in');
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const userId = await ensureAuthSession();
      const now = new Date().toISOString();

      // Soft-delete all user data (children first for FK safety)
      // achievement_tags — no deleted_at, but parent achievements will be soft-deleted
      // achievement_responses — no deleted_at, but parent achievements will be soft-deleted

      await supabase
        .from('professional_achievements')
        .update({ deleted_at: now })
        .eq('user_id', userId)
        .is('deleted_at', null);

      await supabase
        .from('entries')
        .update({ deleted_at: now })
        .eq('user_id', userId)
        .is('deleted_at', null);

      await supabase
        .from('projects')
        .update({ deleted_at: now })
        .eq('user_id', userId)
        .is('deleted_at', null);

      await supabase
        .from('companies')
        .update({ deleted_at: now })
        .eq('user_id', userId)
        .is('deleted_at', null);

      await supabase
        .from('notification_schedules')
        .update({ deleted_at: now })
        .eq('user_id', userId)
        .is('deleted_at', null);

      // Soft-delete tags owned by this user
      await supabase
        .from('tags')
        .update({ deleted_at: now })
        .eq('user_id', userId)
        .is('deleted_at', null);

      // Clear current_company_id before soft-deleting the user row
      await supabase
        .from('users')
        .update({ current_company_id: null, deleted_at: now })
        .eq('user_id', userId);

      // Delete auth.users row so the email can be reused for sign-up
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await supabase.functions.invoke('delete-account', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      }

      // Sign out and clear local state
      setShowDeleteConfirm(false);
      await signOut();
      clear();
      router.replace('/(auth)/sign-in');
    } catch (err) {
      console.error('[Settings] Delete account failed:', err);
      setDeleting(false);
    }
  };

  const initial = profile?.first_name?.charAt(0)?.toUpperCase() || '?';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <FontAwesome name="times" size={15} color={colors.umber} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Profile card */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => router.push('/settings/profile')}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[colors.moss, colors.mossDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </LinearGradient>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile?.first_name || ''} {profile?.last_name || ''}
            </Text>
            <Text style={styles.profileEmail}>{profile?.email}</Text>
            {currentCompany && (
              <View style={styles.companyPill}>
                <FontAwesome name="building-o" size={10} color={colors.moss} />
                <Text style={styles.companyPillText}>
                  {currentCompany.name}
                  {currentCompany.role_title ? ` · ${currentCompany.role_title}` : ''}
                </Text>
              </View>
            )}
          </View>
          <FontAwesome name="chevron-right" size={12} color={colors.umber} />
        </TouchableOpacity>

        {/* App group */}
        <Text style={styles.sectionLabel}>APP</Text>
        <View style={styles.groupCard}>
          <SettingsRow
            icon="bell-o"
            label="Notifications"
            sub="Manage your reminder schedules"
            onPress={() => router.push('/settings/notifications')}
          />
          <SettingsRow
            icon="sliders"
            label="Preferences"
            sub="Synthesis format, theme, audio"
            onPress={() => router.push('/settings/preferences')}
          />
          <SettingsRow
            icon="tags"
            label="Tags"
            sub="Manage your tag library"
            onPress={() => router.push('/settings/tags')}
            last
          />
        </View>

        {/* Account group */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.groupCard}>
          <SettingsRow
            icon="building-o"
            label="Company history"
            sub="Add or update your roles"
            onPress={() => router.push('/settings/companies')}
          />
          <SettingsRow
            icon="sign-out"
            label="Sign out"
            onPress={handleSignOut}
            danger
            last
          />
        </View>

        <Text style={styles.versionText}>
          Career Memory · v1.0
        </Text>

        {/* Delete account — subtle footer link */}
        <TouchableOpacity onPress={() => setShowDeleteConfirm(true)}>
          <Text style={styles.deleteLink}>Delete account</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Delete confirmation modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete your account?</Text>
            <Text style={styles.modalBody}>
              All your entries, achievements, and projects will be permanently removed. This can't be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDelete}
                onPress={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.modalDeleteText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SettingsRow({
  icon,
  label,
  sub,
  onPress,
  danger,
  last,
}: {
  icon: string;
  label: string;
  sub?: string;
  onPress: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <FontAwesome
          name={icon as any}
          size={14}
          color={danger ? colors.danger : colors.moss}
        />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      <FontAwesome
        name="chevron-right"
        size={12}
        color={danger ? colors.danger : colors.umber}
      />
    </TouchableOpacity>
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
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  headerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    color: colors.walnut,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 18,
    marginBottom: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: colors.walnut,
  },
  profileEmail: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.umber,
    marginTop: 1,
  },
  companyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.mossFaint,
    borderWidth: 1,
    borderColor: colors.mossBorder,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  companyPillText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10.5,
    color: colors.moss,
  },
  sectionLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    letterSpacing: 1,
    color: colors.umber,
    marginHorizontal: 18,
    marginBottom: 8,
  },
  groupCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    overflow: 'hidden',
    marginHorizontal: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.mossFaint,
    borderWidth: 1,
    borderColor: colors.mossBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconDanger: {
    backgroundColor: colors.dangerFaint,
    borderColor: colors.dangerBorder,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13.5,
    color: colors.walnut,
  },
  rowLabelDanger: {
    color: colors.danger,
  },
  rowSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.umber,
    marginTop: 1,
  },
  versionText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10.5,
    color: colors.umber,
    textAlign: 'center',
    paddingTop: 24,
    paddingBottom: 6,
  },
  deleteLink: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.danger,
    textAlign: 'center',
    paddingBottom: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(42,33,24,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    color: colors.walnut,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBody: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.umber,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.bg,
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
  },
  modalDelete: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: colors.danger,
    alignItems: 'center',
  },
  modalDeleteText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: colors.white,
  },
});
