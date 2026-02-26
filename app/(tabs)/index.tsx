import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { useUserStore } from '@/stores/userStore';
import { useStats } from '@/hooks/useStats';
import { useHighlights } from '@/hooks/useHighlights';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

function getGreetingTime() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const { data: stats } = useStats();
  const { data: highlights } = useHighlights();

  const firstName = profile?.first_name ?? 'there';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.timeGreeting}>{getGreetingTime()}</Text>
          <Text style={styles.nameGreeting}>Welcome back, {firstName}</Text>
        </View>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => router.push('/settings' as never)}
        >
          <Text style={styles.avatarText}>
            {firstName.charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent Focus */}
      <SectionLabel>Recent focus</SectionLabel>
      <Card accentPosition="left" accentColor={colors.moss} style={styles.recentFocusCard}>
        <View style={styles.cardPadding}>
          <Text style={styles.recentFocusText}>
            Add a few more entries to get your overview.
          </Text>
        </View>
      </Card>

      {/* Add Entry CTA */}
      <TouchableOpacity
        style={styles.ctaCard}
        activeOpacity={0.85}
        onPress={() => router.push('/entry/new')}
      >
        <View style={styles.ctaMicCircle}>
          <FontAwesome name="microphone" size={18} color={colors.white} />
        </View>
        <View style={styles.ctaTextBlock}>
          <Text style={styles.ctaTitle}>Log an achievement</Text>
          <Text style={styles.ctaSubtitle}>Voice or text · takes 2 minutes</Text>
        </View>
        <FontAwesome name="chevron-right" size={14} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>

      {/* Stats */}
      <SectionLabel style={styles.sectionSpacing}>Your progress</SectionLabel>
      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.stat} onPress={() => router.push('/(tabs)/entries')}>
          <Text style={styles.statNumber}>{stats?.entries ?? 0}</Text>
          <Text style={styles.statLabel}>Entries</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.stat} onPress={() => router.push('/(tabs)/entries')}>
          <Text style={styles.statNumber}>{stats?.achievements ?? 0}</Text>
          <Text style={styles.statLabel}>Achievements</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.stat} onPress={() => router.push('/(tabs)/projects')}>
          <Text style={styles.statNumber}>{stats?.projects ?? 0}</Text>
          <Text style={styles.statLabel}>Projects</Text>
        </TouchableOpacity>
      </View>

      {/* Highlights */}
      <View style={styles.highlightsHeader}>
        <SectionLabel>Highlights</SectionLabel>
      </View>
      {highlights && highlights.length > 0 ? (
        highlights.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.highlightRow}
            onPress={() => {
              if (item.type === 'achievement') {
                router.push(`/achievement/${item.id}`);
              } else {
                router.push(`/project/${item.id}`);
              }
            }}
          >
            <View style={styles.highlightIcon}>
              <FontAwesome name="star" size={14} color={colors.amber} />
            </View>
            <View style={styles.highlightTextBlock}>
              <Text style={styles.highlightName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.highlightType}>{item.type}</Text>
            </View>
            <FontAwesome name="chevron-right" size={12} color={colors.umber} />
          </TouchableOpacity>
        ))
      ) : (
        <EmptyState message="Mark an achievement as a highlight and it'll appear here." />
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerText: {
    flex: 1,
  },
  timeGreeting: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: colors.umber,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  nameGreeting: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 24,
    color: colors.walnut,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.moss,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  avatarText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: colors.white,
  },
  recentFocusCard: {
    marginBottom: 16,
  },
  cardPadding: {
    padding: layout.spacing.lg,
    paddingLeft: layout.spacing.lg + layout.accentBar.width,
  },
  recentFocusText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.umber,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  ctaCard: {
    backgroundColor: colors.moss,
    borderRadius: layout.borderRadius.lg,
    padding: layout.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  ctaMicCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ctaTextBlock: {
    flex: 1,
  },
  ctaTitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: colors.white,
    marginBottom: 2,
  },
  ctaSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  sectionSpacing: {
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: layout.spacing.lg,
    marginBottom: 24,
    ...layout.shadow.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 28,
    color: colors.walnut,
  },
  statLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.umber,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.divider,
    marginVertical: 4,
  },
  highlightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    marginBottom: 8,
  },
  highlightIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.amberFaint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  highlightTextBlock: {
    flex: 1,
  },
  highlightName: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.walnut,
  },
  highlightType: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.umber,
    marginTop: 1,
  },
});
