import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { AISummaryCard } from '@/components/ui/AISummaryCard';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { InlineProjectPicker } from '@/components/projects/InlineProjectPicker';
import type { SynthesisResult } from '@/types/app';

interface ReviewStepProps {
  synthesis: SynthesisResult;
  projectId: string | null;
  onProjectSelect: (id: string | null) => void;
  onSave: () => void;
  onAddAnother: () => void;
  saving: boolean;
  onNameChange: (name: string) => void;
}

export function ReviewStep({
  synthesis,
  projectId,
  onProjectSelect,
  onSave,
  onAddAnother,
  saving,
  onNameChange,
}: ReviewStepProps) {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(synthesis.ai_generated_name);
  const [editingSummary, setEditingSummary] = useState(false);
  const [summary, setSummary] = useState(synthesis.synthesis_paragraph);
  const [tags, setTags] = useState<string[]>(synthesis.tag_suggestions);

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleNameDone = () => {
    setEditingName(false);
    onNameChange(name);
  };

  return (
    <View style={styles.flex}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Achievement name */}
        <Text style={styles.sectionLabel}>ACHIEVEMENT</Text>
        {editingName ? (
          <View style={styles.nameEditRow}>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              onBlur={handleNameDone}
              onSubmitEditing={handleNameDone}
              autoFocus
            />
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditingName(true)}>
            <Text style={styles.achievementName}>{name}</Text>
            <Text style={styles.editHint}>Tap to edit name</Text>
          </TouchableOpacity>
        )}

        {/* AI Summary */}
        <View style={styles.summarySection}>
          {editingSummary ? (
            <Card style={styles.editSummaryCard}>
              <TextInput
                style={styles.summaryInput}
                value={summary}
                onChangeText={setSummary}
                multiline
                autoFocus
              />
              <TouchableOpacity
                style={styles.doneEditBtn}
                onPress={() => setEditingSummary(false)}
              >
                <Text style={styles.doneEditText}>Done</Text>
              </TouchableOpacity>
            </Card>
          ) : (
            <>
              <AISummaryCard text={summary} />
              <TouchableOpacity onPress={() => setEditingSummary(true)}>
                <Text style={styles.editSummaryLink}>Edit summary</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Bullets */}
        {synthesis.synthesis_bullets.length > 0 && (
          <View style={styles.bulletsSection}>
            <Text style={styles.sectionLabel}>KEY POINTS</Text>
            {synthesis.synthesis_bullets.map((bullet, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        )}

        {/* STAR Breakdown */}
        <Text style={styles.sectionLabel}>STAR BREAKDOWN</Text>
        {[
          { label: 'Situation', value: synthesis.star_situation },
          { label: 'Task', value: synthesis.star_task },
          { label: 'Action', value: synthesis.star_action },
          { label: 'Result', value: synthesis.star_result },
        ].map((item) => (
          <Card key={item.label} style={styles.starCard}>
            <View style={styles.starContent}>
              <Text style={styles.starLabel}>{item.label}</Text>
              <Text style={styles.starText}>{item.value}</Text>
            </View>
          </Card>
        ))}

        {/* Tags */}
        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>TAGS</Text>
        <View style={styles.tagsRow}>
          {tags.map((tag) => (
            <Tag
              key={tag}
              label={tag}
              variant="removable"
              onRemove={() => handleRemoveTag(tag)}
            />
          ))}
        </View>

        {/* Project */}
        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>PROJECT</Text>
        <InlineProjectPicker
          selectedProjectId={projectId}
          onSelect={onProjectSelect}
        />

        {/* Completeness */}
        <View style={styles.completenessRow}>
          <FontAwesome name="bar-chart" size={14} color={colors.umber} />
          <Text style={styles.completenessText}>
            Completeness: {synthesis.completeness_score}%
          </Text>
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <Button
          title="+ Add another"
          variant="secondary"
          onPress={onAddAnother}
          style={styles.addAnotherBtn}
        />
        <Button
          title="Save & done"
          onPress={onSave}
          loading={saving}
          style={styles.saveBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  sectionLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    color: colors.umber,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  achievementName: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 20,
    color: colors.walnut,
    marginBottom: 2,
  },
  editHint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.umber,
    marginBottom: 16,
  },
  nameEditRow: {
    marginBottom: 16,
  },
  nameInput: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 20,
    color: colors.walnut,
    borderBottomWidth: 2,
    borderBottomColor: colors.moss,
    paddingBottom: 4,
  },
  summarySection: {
    marginBottom: 20,
  },
  editSummaryLink: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: colors.moss,
    marginTop: 8,
  },
  editSummaryCard: {
    padding: 14,
  },
  summaryInput: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.walnut,
    minHeight: 80,
  },
  doneEditBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  doneEditText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.moss,
  },
  bulletsSection: {
    marginBottom: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 4,
  },
  bulletDot: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.walnut,
    marginRight: 8,
    lineHeight: 20,
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
    marginBottom: 8,
  },
  completenessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  completenessText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.umber,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    padding: 16,
    paddingBottom: 32,
    flexDirection: 'row',
    gap: 12,
  },
  addAnotherBtn: {
    flex: 1,
  },
  saveBtn: {
    flex: 1,
  },
});
