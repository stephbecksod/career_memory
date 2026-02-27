import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { Card } from '@/components/ui/Card';
import type { Entry } from '@/types/database';

interface EntryCardProps {
  entry: Entry;
  achievementCount: number;
  companyName?: string | null;
}

export function EntryCard({ entry, achievementCount, companyName }: EntryCardProps) {
  const router = useRouter();

  const dateStr = new Date(entry.entry_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/entry/${entry.entry_id}`)}
    >
      <Card accentPosition="left" accentColor={colors.moss} accentOpacity={0.35} style={styles.card}>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.date}>{dateStr}</Text>
            {companyName && (
              <View style={styles.companyRow}>
                <FontAwesome name="building-o" size={11} color={colors.umber} />
                <Text style={styles.company}>{companyName}</Text>
              </View>
            )}
          </View>
          {entry.ai_generated_summary && (
            <Text style={styles.summary} numberOfLines={2}>
              {entry.ai_generated_summary}
            </Text>
          )}
          <View style={styles.bottomRow}>
            <View style={styles.countPill}>
              <FontAwesome name="bars" size={10} color={colors.moss} />
              <Text style={styles.countText}>
                {achievementCount} achievement{achievementCount !== 1 ? 's' : ''}
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={12} color={colors.umber} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
  content: {
    padding: 14,
    paddingLeft: 14 + layout.accentBar.width,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  date: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: colors.walnut,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  company: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.umber,
  },
  summary: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
    lineHeight: 19,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.mossFaint,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: colors.moss,
  },
});
