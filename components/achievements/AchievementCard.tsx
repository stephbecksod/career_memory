import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { Card } from '@/components/ui/Card';
import type { ProfessionalAchievement } from '@/types/database';

interface AchievementCardProps {
  achievement: ProfessionalAchievement;
  projectName?: string | null;
}

export function AchievementCard({ achievement, projectName }: AchievementCardProps) {
  const router = useRouter();
  const isHighlight = achievement.is_highlight;

  const dateStr = new Date(achievement.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const name = achievement.ai_generated_name ?? `${achievement.created_at.slice(0, 10)} achievement`;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/achievement/${achievement.achievement_id}`)}
    >
      <Card
        accentPosition={isHighlight ? 'left' : 'none'}
        accentColor={colors.amber}
        accentOpacity={0.65}
        style={styles.card}
      >
        <View style={[styles.content, isHighlight && styles.contentWithAccent]}>
          <View style={styles.topRow}>
            <Text style={styles.date}>{dateStr}</Text>
            {isHighlight && (
              <FontAwesome name="star" size={12} color={colors.amber} />
            )}
          </View>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          {achievement.synthesis_paragraph && (
            <Text style={styles.excerpt} numberOfLines={2}>
              {achievement.synthesis_paragraph}
            </Text>
          )}
          <View style={styles.bottomRow}>
            <View style={styles.bottomLeft}>
              {projectName && (
                <View style={styles.projectPill}>
                  <FontAwesome name="folder-o" size={10} color={colors.moss} />
                  <Text style={styles.projectText}>{projectName}</Text>
                </View>
              )}
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
  },
  contentWithAccent: {
    paddingLeft: 14 + layout.accentBar.width,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  date: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.umber,
  },
  name: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13.5,
    color: colors.walnut,
    marginBottom: 4,
  },
  excerpt: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.walnut,
    opacity: 0.7,
    lineHeight: 17,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  projectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.mossFaint,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  projectText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: colors.moss,
  },
});
