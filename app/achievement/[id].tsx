import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/userStore';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { AISummaryCard } from '@/components/ui/AISummaryCard';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { InlineProjectPicker } from '@/components/projects/InlineProjectPicker';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import type { ProfessionalAchievement, AchievementTag, Tag as TagType } from '@/types/database';

interface AchievementFull extends ProfessionalAchievement {
  achievement_tags: (AchievementTag & { tag: TagType })[];
}

export default function AchievementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useUserStore((s) => s.authUser?.id);
  const queryClient = useQueryClient();

  const { data: achievement, isLoading } = useQuery<AchievementFull>({
    queryKey: ['achievement', id],
    enabled: !!id && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_achievements')
        .select('*, achievement_tags(*, tag:tags(*))')
        .eq('achievement_id', id!)
        .eq('user_id', userId!)
        .is('deleted_at', null)
        .single();
      if (error) throw error;
      return data as AchievementFull;
    },
  });

  const toggleHighlight = useMutation({
    mutationFn: async () => {
      if (!achievement) return;
      const { error } = await supabase
        .from('professional_achievements')
        .update({ is_highlight: !achievement.is_highlight })
        .eq('achievement_id', achievement.achievement_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievement', id] });
      queryClient.invalidateQueries({ queryKey: ['highlights'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });

  const updateProject = useMutation({
    mutationFn: async (projectId: string | null) => {
      if (!achievement) return;
      const { error } = await supabase
        .from('professional_achievements')
        .update({ project_id: projectId })
        .eq('achievement_id', achievement.achievement_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievement', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  if (isLoading) return <LoadingIndicator fullScreen />;
  if (!achievement) return null;

  const name = achievement.ai_generated_name ?? 'Achievement';
  const confirmedTags = (achievement.achievement_tags ?? []).filter((at) => at.is_confirmed);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <FontAwesome name="arrow-left" size={18} color={colors.walnut} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Achievement</Text>
        <TouchableOpacity
          onPress={() => toggleHighlight.mutate()}
          style={[
            styles.highlightBtn,
            achievement.is_highlight && styles.highlightBtnActive,
          ]}
        >
          <FontAwesome
            name="star"
            size={16}
            color={achievement.is_highlight ? colors.amber : colors.umber}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.achievementName}>{name}</Text>
        <Text style={styles.date}>
          {new Date(achievement.created_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
          {achievement.company_name_snapshot && ` · ${achievement.company_name_snapshot}`}
        </Text>

        {/* AI Summary */}
        {achievement.synthesis_paragraph && (
          <View style={styles.section}>
            <AISummaryCard text={achievement.synthesis_paragraph} />
          </View>
        )}

        {/* Bullets */}
        {achievement.synthesis_bullets && achievement.synthesis_bullets.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>KEY POINTS</Text>
            {achievement.synthesis_bullets.map((b, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        )}

        {/* STAR */}
        <Text style={styles.sectionLabel}>STAR BREAKDOWN</Text>
        {[
          { label: 'Situation', value: achievement.star_situation },
          { label: 'Task', value: achievement.star_task },
          { label: 'Action', value: achievement.star_action },
          { label: 'Result', value: achievement.star_result },
        ]
          .filter((s) => s.value)
          .map((s) => (
            <Card key={s.label} style={styles.starCard}>
              <View style={styles.starContent}>
                <Text style={styles.starLabel}>{s.label}</Text>
                <Text style={styles.starText}>{s.value}</Text>
              </View>
            </Card>
          ))}

        {/* Tags */}
        {confirmedTags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TAGS</Text>
            <View style={styles.tagsRow}>
              {confirmedTags.map((at) => (
                <Tag key={at.achievement_tag_id} label={at.tag?.name ?? at.tag_id} />
              ))}
            </View>
          </View>
        )}

        {/* Project */}
        <Text style={styles.sectionLabel}>PROJECT</Text>
        <InlineProjectPicker
          selectedProjectId={achievement.project_id}
          onSelect={(pid) => updateProject.mutate(pid)}
        />
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
  topTitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: colors.walnut,
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
  achievementName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    color: colors.walnut,
    marginBottom: 4,
  },
  date: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.umber,
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
    marginBottom: 8,
    marginTop: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bulletDot: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.walnut,
    marginRight: 8,
  },
  bulletText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.walnut,
    flex: 1,
    lineHeight: 20,
  },
  starCard: {
    marginBottom: 8,
  },
  starContent: {
    padding: 14,
  },
  starLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: colors.moss,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  starText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
    lineHeight: 19,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
