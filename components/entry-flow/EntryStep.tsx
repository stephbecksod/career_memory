import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { SYSTEM_QUESTIONS, QUESTION_KEYS } from '@/constants/questions';
import { Button } from '@/components/ui/Button';
import { InlineProjectPicker } from '@/components/projects/InlineProjectPicker';

interface EntryStepProps {
  mainInput: string;
  onMainInputChange: (text: string) => void;
  starInputs: Record<string, string>;
  onStarInputChange: (key: string, text: string) => void;
  selectedProjectId: string | null;
  onProjectSelect: (id: string | null) => void;
  onSynthesize: () => void;
}

const STAR_QUESTIONS = SYSTEM_QUESTIONS.filter(
  (q) => q.key !== QUESTION_KEYS.HEADLINE,
);

export function EntryStep({
  mainInput,
  onMainInputChange,
  starInputs,
  onStarInputChange,
  selectedProjectId,
  onProjectSelect,
  onSynthesize,
}: EntryStepProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const canSynthesize = mainInput.trim().length > 3;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Main input */}
        <Text style={styles.mainLabel}>What did you accomplish?</Text>
        <Text style={styles.helperText}>
          Think about what you were working on, why it mattered, what you specifically did, and what the outcome was
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.mainInput}
            placeholder="Describe your achievement..."
            placeholderTextColor={colors.umber}
            multiline
            value={mainInput}
            onChangeText={onMainInputChange}
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.micButton}>
            <FontAwesome name="microphone" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* STAR accordion */}
        <Text style={styles.optionalLabel}>OPTIONAL DETAILS</Text>
        {STAR_QUESTIONS.map((q) => {
          const isExpanded = expandedKey === q.key;
          const hasContent = (starInputs[q.key] ?? '').trim().length > 0;

          return (
            <View key={q.key} style={styles.accordionItem}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setExpandedKey(isExpanded ? null : q.key)}
              >
                <View style={styles.accordionLeft}>
                  {hasContent && <View style={styles.greenDot} />}
                  <Text style={styles.accordionTitle}>{q.text}</Text>
                </View>
                <FontAwesome
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={12}
                  color={colors.umber}
                />
              </TouchableOpacity>
              {isExpanded && (
                <View style={styles.accordionBody}>
                  <Text style={styles.accordionHelper}>{q.helperText}</Text>
                  <TextInput
                    style={styles.accordionInput}
                    placeholder="Type here..."
                    placeholderTextColor={colors.umber}
                    multiline
                    value={starInputs[q.key] ?? ''}
                    onChangeText={(text) => onStarInputChange(q.key, text)}
                    textAlignVertical="top"
                  />
                </View>
              )}
            </View>
          );
        })}

        {/* Project picker */}
        <Text style={styles.optionalLabel}>PROJECT</Text>
        <InlineProjectPicker
          selectedProjectId={selectedProjectId}
          onSelect={onProjectSelect}
        />
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        {!canSynthesize && (
          <Text style={styles.hintText}>Write something above to continue.</Text>
        )}
        <Button
          title="Synthesize"
          onPress={onSynthesize}
          disabled={!canSynthesize}
          style={styles.synthesizeBtn}
        />
      </View>
    </KeyboardAvoidingView>
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
  mainLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: colors.walnut,
    marginBottom: 6,
  },
  helperText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.umber,
    lineHeight: 18,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  mainInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.walnut,
    minHeight: 100,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.moss,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginTop: 4,
  },
  optionalLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    color: colors.umber,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 8,
  },
  accordionItem: {
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 8,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.moss,
    marginRight: 8,
  },
  accordionTitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: colors.walnut,
    flex: 1,
  },
  accordionBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  accordionHelper: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.umber,
    marginBottom: 8,
  },
  accordionInput: {
    backgroundColor: colors.bg,
    borderRadius: layout.borderRadius.sm,
    padding: 10,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.walnut,
    minHeight: 60,
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
  },
  hintText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.umber,
    textAlign: 'center',
    marginBottom: 8,
  },
  synthesizeBtn: {
    width: '100%',
  },
});
