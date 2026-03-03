import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SuggestedSplit } from '@/types/app';

interface SplitPromptProps {
  splits: SuggestedSplit[];
  onDismiss: () => void;
  onAcceptSplits: (selectedSplits: SuggestedSplit[]) => void;
  saving: boolean;
}

export function SplitPrompt({ splits, onDismiss, onAcceptSplits, saving }: SplitPromptProps) {
  const [accepted, setAccepted] = useState(false);
  const [selected, setSelected] = useState<boolean[]>(() => splits.map(() => true));

  const selectedCount = selected.filter(Boolean).length;

  const toggleSplit = (index: number) => {
    setSelected((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handleSave = () => {
    const selectedSplits = splits.filter((_, i) => selected[i]);
    if (selectedSplits.length > 0) {
      onAcceptSplits(selectedSplits);
    }
  };

  if (!accepted) {
    return (
      <View style={styles.promptCard}>
        <View style={styles.promptHeader}>
          <View style={styles.promptIconWrap}>
            <FontAwesome name="scissors" size={14} color={colors.amber} />
          </View>
          <Text style={styles.promptTitle}>Multiple achievements detected</Text>
        </View>
        <Text style={styles.promptBody}>
          Looks like you covered a few things. Want to split these into separate achievements?
        </Text>
        <View style={styles.promptActions}>
          <Button
            title="Keep as one"
            variant="secondary"
            onPress={onDismiss}
            style={styles.promptBtn}
          />
          <Button
            title={`Split into ${splits.length}`}
            onPress={() => setAccepted(true)}
            style={styles.promptBtn}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.splitContainer}>
      <Text style={styles.splitHeader}>
        Select which achievements to save
      </Text>
      {splits.map((split, i) => (
        <TouchableOpacity
          key={i}
          style={styles.splitCardWrap}
          onPress={() => toggleSplit(i)}
          activeOpacity={0.7}
        >
          <Card style={[styles.splitCard, selected[i] && styles.splitCardSelected]}>
            <View style={styles.splitRow}>
              <View style={[styles.checkbox, selected[i] && styles.checkboxChecked]}>
                {selected[i] && (
                  <FontAwesome name="check" size={10} color="#fff" />
                )}
              </View>
              <View style={styles.splitContent}>
                <Text style={styles.splitName}>{split.name}</Text>
                <Text style={styles.splitParagraph} numberOfLines={3}>
                  {split.paragraph}
                </Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
      <Button
        title={`Save ${selectedCount} achievement${selectedCount !== 1 ? 's' : ''}`}
        onPress={handleSave}
        loading={saving}
        disabled={selectedCount === 0}
        style={styles.saveBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  promptCard: {
    backgroundColor: colors.amberFaint,
    borderWidth: 1,
    borderColor: colors.amberBorder,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  promptIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(201,148,26,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptTitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: colors.walnut,
  },
  promptBody: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.walnut,
    lineHeight: 20,
    marginBottom: 14,
  },
  promptActions: {
    flexDirection: 'row',
    gap: 10,
  },
  promptBtn: {
    flex: 1,
  },
  splitContainer: {
    marginBottom: 20,
  },
  splitHeader: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    color: colors.umber,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  splitCardWrap: {
    marginBottom: 10,
  },
  splitCard: {
    padding: 0,
    overflow: 'hidden',
  },
  splitCardSelected: {
    borderColor: colors.mossBorder,
  },
  splitRow: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.umber,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.moss,
    borderColor: colors.moss,
  },
  splitContent: {
    flex: 1,
  },
  splitName: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: colors.walnut,
    marginBottom: 4,
  },
  splitParagraph: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
    lineHeight: 19,
  },
  saveBtn: {
    marginTop: 6,
  },
});
