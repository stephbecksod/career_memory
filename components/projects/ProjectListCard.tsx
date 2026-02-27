import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { ProjectWithCount } from '@/hooks/useProjects';

interface ProjectListCardProps {
  project: ProjectWithCount;
}

export function ProjectListCard({ project }: ProjectListCardProps) {
  const router = useRouter();
  const isHighlight = project.is_highlight;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/project/${project.project_id}`)}
    >
      <Card
        accentPosition="top"
        accentColor={isHighlight ? colors.amber : colors.moss}
        accentOpacity={isHighlight ? 0.7 : 0.3}
        style={styles.card}
      >
        <View style={styles.content}>
          <View style={styles.topRow}>
            <FontAwesome
              name="folder-o"
              size={16}
              color={isHighlight ? colors.amber : colors.moss}
            />
            <Text style={styles.name} numberOfLines={1}>{project.name}</Text>
          </View>
          {project.highlight_summary ? (
            <Text style={styles.summary} numberOfLines={3}>
              {project.highlight_summary}
            </Text>
          ) : project.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {project.description}
            </Text>
          ) : null}
          <View style={styles.bottomRow}>
            <StatusBadge status={project.status} />
            <Text style={styles.count}>
              {project.achievement_count} achievement{project.achievement_count !== 1 ? 's' : ''}
            </Text>
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
    paddingTop: 14 + layout.accentBar.width,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  name: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: colors.walnut,
    flex: 1,
  },
  summary: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12.5,
    color: colors.walnut,
    lineHeight: 18,
    marginBottom: 10,
    opacity: 0.8,
  },
  description: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.umber,
    lineHeight: 18,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.umber,
  },
});
