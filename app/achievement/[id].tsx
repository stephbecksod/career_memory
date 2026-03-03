import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useTags } from '@/hooks/useTags';
import { synthesizeProjectSummary } from '@/lib/synthesis';
import { useUserStore } from '@/stores/userStore';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { BackButton } from '@/components/ui/BackButton';
import { AISummaryCard } from '@/components/ui/AISummaryCard';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { InlineProjectPicker } from '@/components/projects/InlineProjectPicker';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import type { ProfessionalAchievement, AchievementTag, Tag as TagType } from '@/types/database';

interface TagWithDetails extends AchievementTag {
  tag: TagType | null;
}

interface AchievementResponse {
  response_id: string;
  question_key: string;
  question_text_snapshot: string;
  response_text: string;
}

export default function AchievementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useUserStore((s) => s.authUser?.id);
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const { data: allTags } = useTags();
  const [editedFields, setEditedFields] = useState<{
    name: string;
    summary: string;
    star_situation: string;
    star_task: string;
    star_action: string;
    star_result: string;
  }>({ name: '', summary: '', star_situation: '', star_task: '', star_action: '', star_result: '' });
  const [notesExpanded, setNotesExpanded] = useState(false);

  const { data: achievement, isLoading } = useQuery<ProfessionalAchievement>({
    queryKey: ['achievement', id],
    enabled: !!id && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_achievements')
        .select('*')
        .eq('achievement_id', id!)
        .eq('user_id', userId!)
        .is('deleted_at', null)
        .single();
      if (error) throw error;
      return data as ProfessionalAchievement;
    },
  });

  const { data: tags } = useQuery<TagWithDetails[]>({
    queryKey: ['achievement-tags', id],
    enabled: !!id && !!achievement,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievement_tags')
        .select('*, tag:tags(*)')
        .eq('achievement_id', id!);
      if (error) throw error;
      return (data ?? []) as TagWithDetails[];
    },
  });

  const { data: responses } = useQuery<AchievementResponse[]>({
    queryKey: ['achievement-responses', id],
    enabled: !!id && !!achievement,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievement_responses')
        .select('response_id, question_key, question_text_snapshot, response_text')
        .eq('achievement_id', id!);
      if (error) throw error;
      return (data ?? []) as AchievementResponse[];
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
      queryClient.invalidateQueries({ queryKey: ['achievement-tags', id] });
      queryClient.invalidateQueries({ queryKey: ['highlights'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });

  const saveEdits = useMutation({
    mutationFn: async () => {
      if (!achievement) return;
      const { error } = await supabase
        .from('professional_achievements')
        .update({
          ai_generated_name: editedFields.name,
          synthesis_paragraph: editedFields.summary,
          star_situation: editedFields.star_situation || null,
          star_task: editedFields.star_task || null,
          star_action: editedFields.star_action || null,
          star_result: editedFields.star_result || null,
        })
        .eq('achievement_id', achievement.achievement_id);
      if (error) throw error;
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['achievement', id] });
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

      // Trigger project summary generation for the new project (non-blocking)
      if (projectId && userId) {
        triggerProjectSummary(projectId, userId).catch((err) => {
          console.warn('[AchievementDetail] Project summary generation failed:', err);
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievement', id] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
    },
  });

  const addTag = useMutation({
    mutationFn: async (tagName: string) => {
      if (!achievement || !userId) return;
      const slug = tagName.trim().toLowerCase().replace(/\s+/g, '_');
      if (!slug) return;

      // Find or create the tag
      let tagId: string | null = null;
      const { data: existingTags } = await supabase
        .from('tags')
        .select('tag_id')
        .eq('slug', slug)
        .limit(1);

      if (existingTags && existingTags.length > 0) {
        tagId = existingTags[0].tag_id;
      } else {
        const newTagId = crypto.randomUUID();
        const { error } = await supabase.from('tags').insert({
          tag_id: newTagId,
          user_id: userId,
          name: tagName.trim(),
          slug,
        });
        if (error) throw error;
        tagId = newTagId;
      }

      // Check if this tag is already linked
      const { data: existingLink } = await supabase
        .from('achievement_tags')
        .select('achievement_tag_id, is_confirmed')
        .eq('achievement_id', achievement.achievement_id)
        .eq('tag_id', tagId)
        .limit(1);

      if (existingLink && existingLink.length > 0) {
        // Re-confirm if it was unconfirmed
        if (!existingLink[0].is_confirmed) {
          await supabase
            .from('achievement_tags')
            .update({ is_confirmed: true })
            .eq('achievement_tag_id', existingLink[0].achievement_tag_id);
        }
      } else {
        await supabase.from('achievement_tags').insert({
          achievement_id: achievement.achievement_id,
          tag_id: tagId,
          source: 'user',
          is_confirmed: true,
        });
      }
    },
    onSuccess: () => {
      setNewTagName('');
      queryClient.invalidateQueries({ queryKey: ['achievement-tags', id] });
    },
  });

  const enterEditMode = () => {
    if (!achievement) return;
    setEditedFields({
      name: achievement.ai_generated_name ?? '',
      summary: achievement.synthesis_paragraph ?? '',
      star_situation: achievement.star_situation ?? '',
      star_task: achievement.star_task ?? '',
      star_action: achievement.star_action ?? '',
      star_result: achievement.star_result ?? '',
    });
    setIsEditing(true);
  };

  if (isLoading) return <LoadingIndicator fullScreen />;
  if (!achievement) return null;

  const name = achievement.ai_generated_name ?? 'Achievement';
  const confirmedTags = (tags ?? []).filter((at) => at.is_confirmed);
  // Exclude all tags already linked to this achievement (confirmed or not)
  const linkedTagIds = new Set((tags ?? []).map((at) => at.tag_id));

  // Filter available tags for the dropdown: exclude already-linked tags, filter by search text
  const tagSuggestions = (allTags ?? []).filter((t) => {
    if (linkedTagIds.has(t.tag_id)) return false;
    if (!newTagName.trim()) return true;
    return t.name.toLowerCase().includes(newTagName.trim().toLowerCase());
  });

  const starFields = [
    { key: 'star_situation' as const, label: 'Situation', value: achievement.star_situation },
    { key: 'star_task' as const, label: 'Task', value: achievement.star_task },
    { key: 'star_action' as const, label: 'Action', value: achievement.star_action },
    { key: 'star_result' as const, label: 'Result', value: achievement.star_result },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <BackButton label="Entries" onPress={() => router.replace('/(tabs)/entries')} />
        <View style={styles.topBarRight}>
          {/* Highlight pill */}
          <TouchableOpacity
            onPress={() => toggleHighlight.mutate()}
            style={[
              styles.highlightPill,
              achievement.is_highlight && styles.highlightPillActive,
            ]}
          >
            <FontAwesome
              name="star"
              size={12}
              color={achievement.is_highlight ? colors.amber : colors.umber}
            />
            <Text style={[
              styles.highlightPillText,
              achievement.is_highlight && styles.highlightPillTextActive,
            ]}>
              {achievement.is_highlight ? 'Highlighted' : 'Highlight'}
            </Text>
          </TouchableOpacity>
          {/* Edit / Save button */}
          <TouchableOpacity
            onPress={isEditing ? () => saveEdits.mutate() : enterEditMode}
            style={styles.editBtn}
          >
            <FontAwesome
              name={isEditing ? 'check' : 'pencil'}
              size={14}
              color={isEditing ? colors.moss : colors.walnut}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Name */}
        {isEditing ? (
          <TextInput
            style={styles.nameInput}
            value={editedFields.name}
            onChangeText={(t) => setEditedFields((prev) => ({ ...prev, name: t }))}
            placeholder="Achievement name"
            placeholderTextColor={colors.umber}
          />
        ) : (
          <Text style={styles.achievementName}>{name}</Text>
        )}

        <Text style={styles.date}>
          {new Date(achievement.created_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
          {achievement.company_name_snapshot && ` · ${achievement.company_name_snapshot}`}
        </Text>

        {/* AI Summary */}
        {isEditing ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SUMMARY</Text>
            <TextInput
              style={styles.summaryInput}
              value={editedFields.summary}
              onChangeText={(t) => setEditedFields((prev) => ({ ...prev, summary: t }))}
              multiline
              placeholder="Summary"
              placeholderTextColor={colors.umber}
            />
          </View>
        ) : achievement.synthesis_paragraph ? (
          <View style={styles.section}>
            <AISummaryCard text={achievement.synthesis_paragraph} />
          </View>
        ) : null}

        {/* Bullets (read-only, not editable) */}
        {!isEditing && achievement.synthesis_bullets && achievement.synthesis_bullets.length > 0 && (
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
        {isEditing
          ? starFields.map((s) => (
              <Card key={s.key} style={styles.starCard}>
                <View style={styles.starContent}>
                  <Text style={styles.starLabel}>{s.label}</Text>
                  <TextInput
                    style={styles.starInput}
                    value={editedFields[s.key]}
                    onChangeText={(t) =>
                      setEditedFields((prev) => ({ ...prev, [s.key]: t }))
                    }
                    multiline
                    placeholder={`${s.label}...`}
                    placeholderTextColor={colors.umber}
                  />
                </View>
              </Card>
            ))
          : starFields
              .filter((s) => s.value)
              .map((s) => (
                <Card key={s.key} style={styles.starCard}>
                  <View style={styles.starContent}>
                    <Text style={styles.starLabel}>{s.label}</Text>
                    <Text style={styles.starText}>{s.value}</Text>
                  </View>
                </Card>
              ))}

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TAGS</Text>
          <View style={styles.tagsRow}>
            {confirmedTags.map((at) => (
              <Tag key={at.achievement_tag_id} label={at.tag?.name ?? 'Tag'} />
            ))}
          </View>
          {isEditing && (
            <>
              <View style={styles.tagInputRow}>
                <TextInput
                  style={styles.tagInput}
                  value={newTagName}
                  onChangeText={(text) => {
                    setNewTagName(text);
                    setTagDropdownOpen(true);
                  }}
                  placeholder="Add a tag..."
                  placeholderTextColor={colors.umber}
                  onFocus={() => setTagDropdownOpen(true)}
                  onSubmitEditing={() => {
                    if (newTagName.trim()) {
                      addTag.mutate(newTagName);
                      setTagDropdownOpen(false);
                    }
                  }}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[styles.tagAddBtn, !newTagName.trim() && { opacity: 0.4 }]}
                  onPress={() => {
                    if (newTagName.trim()) {
                      addTag.mutate(newTagName);
                      setTagDropdownOpen(false);
                    }
                  }}
                  disabled={!newTagName.trim()}
                >
                  <FontAwesome name="plus" size={12} color={colors.white} />
                </TouchableOpacity>
              </View>
              {tagDropdownOpen && tagSuggestions.length > 0 && (
                <View style={styles.tagDropdown}>
                  <ScrollView style={styles.tagDropdownScroll} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                    {tagSuggestions.slice(0, 8).map((t) => (
                      <TouchableOpacity
                        key={t.tag_id}
                        style={styles.tagDropdownItem}
                        onPress={() => {
                          addTag.mutate(t.name);
                          setNewTagName('');
                          setTagDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.tagDropdownText}>{t.name}</Text>
                        {t.is_system && (
                          <Text style={styles.tagDropdownSystem}>system</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </>
          )}
        </View>

        {/* Project */}
        <Text style={styles.sectionLabel}>PROJECT</Text>
        <InlineProjectPicker
          selectedProjectId={achievement.project_id}
          onSelect={(pid) => updateProject.mutate(pid)}
        />

        {/* Your Notes (collapsible) */}
        {responses && responses.length > 0 && (
          <View style={styles.notesSection}>
            <TouchableOpacity
              style={styles.notesHeader}
              onPress={() => setNotesExpanded(!notesExpanded)}
            >
              <Text style={styles.sectionLabel}>YOUR NOTES</Text>
              <FontAwesome
                name={notesExpanded ? 'chevron-up' : 'chevron-down'}
                size={12}
                color={colors.umber}
              />
            </TouchableOpacity>
            {notesExpanded &&
              responses.map((r) => (
                <View key={r.response_id} style={styles.noteItem}>
                  <Text style={styles.noteQuestion}>{r.question_text_snapshot}</Text>
                  <Text style={styles.noteAnswer}>{r.response_text}</Text>
                </View>
              ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/** Generate project summary when an achievement is assigned to a project */
async function triggerProjectSummary(projectId: string, userId: string) {
  // Check if user has manually edited the summary
  const { data: projectData } = await supabase
    .from('projects')
    .select('name, description, highlight_summary_last_edited_at, highlight_summary_ai')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .limit(1);

  const project = projectData && projectData.length > 0 ? projectData[0] : null;
  if (!project) return;

  // If user has manually edited, don't auto-overwrite
  if (project.highlight_summary_last_edited_at) {
    console.log('[AchievementDetail] Project summary manually edited — skipping auto-update');
    return;
  }

  // Fetch all achievements for this project
  const { data: achievements } = await supabase
    .from('professional_achievements')
    .select('ai_generated_name, synthesis_paragraph, created_at')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (!achievements || achievements.length === 0) return;

  const summary = await synthesizeProjectSummary({
    project_name: project.name,
    project_description: project.description,
    achievements: achievements.map((a) => ({
      name: a.ai_generated_name || 'Untitled achievement',
      paragraph: a.synthesis_paragraph || '',
      date: new Date(a.created_at).toISOString().slice(0, 10),
    })),
  });

  const projectUpdate: Record<string, unknown> = {
    highlight_summary: summary,
  };
  if (!project.highlight_summary_ai) {
    projectUpdate.highlight_summary_ai = summary;
  }

  await supabase
    .from('projects')
    .update(projectUpdate)
    .eq('project_id', projectId);

  console.log('[AchievementDetail] Project summary generated and saved');
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
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  highlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  highlightPillActive: {
    backgroundColor: colors.amberFaint,
    borderColor: colors.amberBorder,
  },
  highlightPillText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: colors.umber,
  },
  highlightPillTextActive: {
    color: colors.amber,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
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
  nameInput: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 19,
    color: colors.walnut,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.mossBorder,
    paddingBottom: 4,
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
  summaryInput: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.walnut,
    lineHeight: 20,
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
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
  starInput: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
    lineHeight: 19,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  tagInput: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.moss,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagDropdown: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  tagDropdownScroll: {
    maxHeight: 200,
  },
  tagDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tagDropdownText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
  },
  tagDropdownSystem: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: colors.umber,
  },
  notesSection: {
    marginTop: 12,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteItem: {
    marginBottom: 12,
  },
  noteQuestion: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: colors.umber,
    marginBottom: 3,
  },
  noteAnswer: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
    lineHeight: 19,
  },
});
