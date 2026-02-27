import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BackButton } from '@/components/ui/BackButton';
import { parseLocalDate } from '@/lib/dates';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import { useAchievements } from '@/hooks/useAchievements';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { AISummaryCard } from '@/components/ui/AISummaryCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AchievementCard } from '@/components/achievements/AchievementCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import type { Project } from '@/types/database';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useUserStore((s) => s.authUser?.id);
  const queryClient = useQueryClient();

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ['project', id],
    enabled: !!id && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('project_id', id!)
        .eq('user_id', userId!)
        .is('deleted_at', null)
        .single();
      if (error) throw error;
      return data as Project;
    },
  });

  const { data: achievements, isLoading: achievementsLoading } = useAchievements({ projectId: id });

  const toggleHighlight = useMutation({
    mutationFn: async () => {
      if (!project) return;
      const { error } = await supabase
        .from('projects')
        .update({ is_highlight: !project.is_highlight })
        .eq('project_id', project.project_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['highlights'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  if (projectLoading || achievementsLoading) return <LoadingIndicator fullScreen />;
  if (!project) return null;

  const dateRange = [
    project.start_date
      ? parseLocalDate(project.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : null,
    project.end_date
      ? parseLocalDate(project.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'Present',
  ]
    .filter(Boolean)
    .join(' – ');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <BackButton label="Projects" onPress={() => router.replace('/(tabs)/projects')} />
        <TouchableOpacity
          onPress={() => toggleHighlight.mutate()}
          style={[
            styles.highlightBtn,
            project.is_highlight && styles.highlightBtnActive,
          ]}
        >
          <FontAwesome
            name="star"
            size={16}
            color={project.is_highlight ? colors.amber : colors.umber}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <FontAwesome name="folder-o" size={20} color={colors.moss} />
          <StatusBadge status={project.status} />
        </View>
        <Text style={styles.projectName}>{project.name}</Text>
        {dateRange && <Text style={styles.dateRange}>{dateRange}</Text>}
        {project.description && (
          <Text style={styles.description}>{project.description}</Text>
        )}

        {/* AI Summary */}
        {project.highlight_summary && (
          <View style={styles.section}>
            <AISummaryCard text={project.highlight_summary} />
          </View>
        )}

        {/* Achievements */}
        <Text style={styles.sectionLabel}>
          ACHIEVEMENTS ({(achievements ?? []).length})
        </Text>
        {(achievements ?? []).length > 0 ? (
          (achievements ?? []).map((a) => (
            <AchievementCard key={a.achievement_id} achievement={a} />
          ))
        ) : (
          <EmptyState message="No achievements linked to this project yet." />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  highlightBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightBtnActive: {
    backgroundColor: colors.amberFaint,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  projectName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    color: colors.walnut,
    marginBottom: 4,
  },
  dateRange: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.umber,
    marginBottom: 8,
  },
  description: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.walnut,
    lineHeight: 20,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    color: colors.umber,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 8,
  },
});
