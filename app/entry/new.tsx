import { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/colors';
import { EntryStep } from '@/components/entry-flow/EntryStep';
import { ProcessingStep } from '@/components/entry-flow/ProcessingStep';
import { ReviewStep } from '@/components/entry-flow/ReviewStep';
import { useSynthesis } from '@/hooks/useSynthesis';
import { useCreateEntry } from '@/hooks/useCreateEntry';
import type { EntryFlowStep } from '@/types/app';
import type { SynthesisResult } from '@/types/app';

export default function NewEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { synthesize } = useSynthesis();
  const createEntry = useCreateEntry();

  const [step, setStep] = useState<EntryFlowStep>('input');
  const [mainInput, setMainInput] = useState('');
  const [starInputs, setStarInputs] = useState<Record<string, string>>({});
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [synthesis, setSynthesis] = useState<SynthesisResult | null>(null);
  const [achievementName, setAchievementName] = useState('');

  const handleStarInputChange = useCallback((key: string, text: string) => {
    setStarInputs((prev) => ({ ...prev, [key]: text }));
  }, []);

  const handleSynthesize = async () => {
    setStep('processing');
    try {
      const result = await synthesize(mainInput, starInputs);
      setSynthesis(result);
      setAchievementName(result.ai_generated_name);
      setStep('review');
    } catch {
      setStep('input');
    }
  };

  const handleSave = async () => {
    if (!synthesis) return;
    try {
      await createEntry.mutateAsync({
        mainInput,
        starInputs,
        synthesis: { ...synthesis, ai_generated_name: achievementName },
        projectId: selectedProjectId,
      });
      router.back();
    } catch {
      // Error is handled by mutation state
    }
  };

  const handleAddAnother = async () => {
    if (!synthesis) return;
    try {
      await createEntry.mutateAsync({
        mainInput,
        starInputs,
        synthesis: { ...synthesis, ai_generated_name: achievementName },
        projectId: selectedProjectId,
      });
      // Reset for new entry
      setMainInput('');
      setStarInputs({});
      setSynthesis(null);
      setAchievementName('');
      setStep('input');
    } catch {
      // Error is handled by mutation state
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Close button */}
      {step !== 'processing' && (
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <FontAwesome name="times" size={20} color={colors.walnut} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>
            {step === 'input' ? 'New Entry' : 'Review'}
          </Text>
          <View style={{ width: 20 }} />
        </View>
      )}

      {step === 'input' && (
        <EntryStep
          mainInput={mainInput}
          onMainInputChange={setMainInput}
          starInputs={starInputs}
          onStarInputChange={handleStarInputChange}
          selectedProjectId={selectedProjectId}
          onProjectSelect={setSelectedProjectId}
          onSynthesize={handleSynthesize}
        />
      )}

      {step === 'processing' && <ProcessingStep />}

      {step === 'review' && synthesis && (
        <ReviewStep
          synthesis={synthesis}
          projectId={selectedProjectId}
          onProjectSelect={setSelectedProjectId}
          onSave={handleSave}
          onAddAnother={handleAddAnother}
          saving={createEntry.isPending}
          onNameChange={setAchievementName}
        />
      )}
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
});
