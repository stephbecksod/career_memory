import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { useUserStore } from '@/stores/userStore';
import { useCompanies } from '@/hooks/useCompanies';
import { LinearGradient } from 'expo-linear-gradient';

type NavItem = {
  id: string;
  label: string;
  route: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
};

const NAV_ITEMS: NavItem[] = [
  { id: 'index', label: 'Home', route: '/(tabs)', icon: 'home' },
  { id: 'summary', label: 'Summary', route: '/(tabs)/summary', icon: 'file-text-o' },
  { id: 'entries', label: 'Entries', route: '/(tabs)/entries', icon: 'list' },
  { id: 'projects', label: 'Projects', route: '/(tabs)/projects', icon: 'folder-o' },
];

function getActiveTab(segments: string[]): string {
  // segments[0] is "(tabs)", segments[1] is the tab name
  const tabSegment = segments[1];
  if (!tabSegment || tabSegment === 'index') return 'index';
  return tabSegment;
}

export default function Sidebar() {
  const router = useRouter();
  const segments = useSegments();
  const profile = useUserStore((s) => s.profile);
  const { currentCompany } = useCompanies();

  const activeTab = segments[0] === '(tabs)' ? getActiveTab(segments) : '';

  const firstName = profile?.first_name || 'User';
  const initial = firstName.charAt(0).toUpperCase();
  const companyName = currentCompany?.name || '';

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoSection}>
        <View style={styles.logoRow}>
          <LinearGradient
            colors={[colors.mossDeep, colors.moss]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoIcon}
          >
            <FontAwesome name="star" size={13} color="rgba(255,255,255,0.9)" />
          </LinearGradient>
          <View>
            <Text style={styles.logoTitle}>Career Memory</Text>
            <Text style={styles.logoSubtitle}>Your career record</Text>
          </View>
        </View>
      </View>

      {/* Log CTA */}
      <View style={styles.ctaSection}>
        <Pressable
          style={styles.ctaButton}
          onPress={() => router.push('/entry/new')}
        >
          <FontAwesome name="plus" size={13} color={colors.white} />
          <Text style={styles.ctaText}>Log achievement</Text>
        </Pressable>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Nav items */}
      <View style={styles.navSection}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Pressable
              key={item.id}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => router.replace(item.route as any)}
            >
              <FontAwesome
                name={item.icon}
                size={18}
                color={isActive ? colors.moss : colors.umber}
              />
              <Text
                style={[
                  styles.navLabel,
                  isActive && styles.navLabelActive,
                ]}
              >
                {item.label}
              </Text>
              {isActive && <View style={styles.activeDot} />}
            </Pressable>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={[colors.mossDeep, colors.moss]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </LinearGradient>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {firstName}
            </Text>
            {companyName ? (
              <Text style={styles.profileCompany} numberOfLines={1}>
                {companyName}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Settings button */}
        <Pressable
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <FontAwesome name="cog" size={16} color={colors.umber} />
          <Text style={styles.settingsLabel}>Settings</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: layout.sidebar.width,
    backgroundColor: colors.sidebar,
    borderRightWidth: 1,
    borderRightColor: colors.divider,
    height: '100%' as any,
    flexShrink: 0,
  },
  logoSection: {
    paddingTop: 28,
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  logoIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.walnut,
    lineHeight: 16,
  },
  logoSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: colors.umber,
    letterSpacing: 0.3,
  },
  ctaSection: {
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.moss,
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  ctaText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 14,
    marginBottom: 14,
  },
  navSection: {
    flex: 1,
    paddingHorizontal: 10,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
  },
  navItemActive: {
    backgroundColor: colors.mossFaint,
  },
  navLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13.5,
    color: colors.walnut,
    flex: 1,
  },
  navLabelActive: {
    fontFamily: 'DMSans_500Medium',
    color: colors.moss,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.moss,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12.5,
    color: colors.walnut,
    lineHeight: 15,
  },
  profileCompany: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10.5,
    color: colors.umber,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  settingsLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
  },
});
