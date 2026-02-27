import { useState, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { CloseButton } from '@/components/ui/BackButton';
import { EntryStep } from '@/components/entry-flow/EntryStep';
import { ProcessingStep } from '@/components/entry-flow/ProcessingStep';
import { ReviewStep } from '@/components/entry-flow/ReviewStep';
import { SynthesisErrorView } from '@/components/entry-flow/SynthesisErrorView';
import { supabase } from '@/lib/supabase';
import { useSynthesis } from '@/hooks/useSynthesis';
import { useSaveEntry } from '@/hooks/useSaveEntry';
import { useSaveSynthesis, useInvalidateEntryQueries } from '@/hooks/useSaveSynthesis';
import type { EntryFlowStep, SynthesisResult } from '@/types/app';

export default function NewEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { synthesize } = useSynthesis();
  const saveEntry = useSaveEntry();
  const saveSynthesis = useSaveSynthesis();
  const invalidateQueries = useInvalidateEntryQueries();

  const [step, setStep] = useState<EntryFlowStep>('input');
  const [mainInput, setMainInput] = useState('');
  const [starInputs, setStarInputs] = useState<Record<string, string>>({});
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [synthesis, setSynthesis] = useState<SynthesisResult | null>(null);
  const [achievementName, setAchievementName] = useState('');

  // Saved IDs — populated after step 2 (save), used for retry and final save
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [savedAchievementId, setSavedAchievementId] = useState<string | null>(null);
  const [synthesisError, setSynthesisError] = useState(false);

  const handleStarInputChange = useCallback((key: string, text: string) => {
    setStarInputs((prev) => ({ ...prev, [key]: text }));
  }, []);

  /**
   * Main flow: save input → synthesize → save synthesis results
   * Steps 2-4 from the plan. User input is saved BEFORE any AI call.
   */
  const handleSynthesize = async () => {
    setStep('processing');
    setSynthesisError(false);

    let entryId: string | null = null;
    let achievementId: string | null = null;

    try {
      // Step 2: Save raw input to DB first (non-negotiable)
      const saved = await saveEntry.mutateAsync({
        mainInput,
        starInputs,
        projectId: selectedProjectId,
      });
      entryId = saved.entryId;
      achievementId = saved.achievementId;
      setSavedEntryId(entryId);
      setSavedAchievementId(achievementId);

      // Step 3: Run AI synthesis
      const result = await synthesize(mainInput, starInputs);
      setSynthesis(result);
      setAchievementName(result.ai_generated_name);

      // Step 4: Save synthesis results to DB
      await saveSynthesis.mutateAsync({
        achievementId,
        entryId,
        synthesis: result,
        projectId: selectedProjectId,
      });

      // Step 5: Show review
      setStep('review');
    } catch (err) {
      console.error('[NewEntry] Flow error:', err);

      if (!achievementId) {
        // Save failed before achievement was created — go back to input so user can retry
        setStep('input');
      } else {
        // Achievement saved, synthesis or synthesis-save failed — show error with retry
        setSavedEntryId(entryId);
        setSavedAchievementId(achievementId);
        setSynthesisError(true);
      }
    }
  };

  /**
   * Retry synthesis only — data is already saved.
   * Re-runs steps 3-4 (synthesize + save synthesis).
   */
  const handleRetry = async () => {
    if (!savedAchievementId || !savedEntryId) return;

    setSynthesisError(false);
    try {
      const result = await synthesize(mainInput, starInputs);
      setSynthesis(result);
      setAchievementName(result.ai_generated_name);

      await saveSynthesis.mutateAsync({
        achievementId: savedAchievementId,
        entryId: savedEntryId,
        synthesis: result,
        projectId: selectedProjectId,
      });

      setStep('review');
    } catch (err) {
      console.error('[NewEntry] Retry failed:', err);
      setSynthesisError(true);
    }
  };

  /** Skip synthesis — navigate to entries tab. Data is already saved. */
  const handleSkip = () => {
    invalidateQueries();
    router.replace('/(tabs)/entries');
  };

  /**
   * Save & done — data is already saved, synthesis results already written.
   * Just navigate away and invalidate queries.
   */
  const handleSave = () => {
    if (!synthesis) return;

    // If user edited the name in review, update just the name
    if (achievementName !== synthesis.ai_generated_name && savedAchievementId) {
      supabase
        .from('professional_achievements')
        .update({ ai_generated_name: achievementName })
        .eq('achievement_id', savedAchievementId)
        .then(({ error }) => {
          if (error) console.error('[NewEntry] Name update failed:', error);
        });
    }

    invalidateQueries();
    router.replace('/(tabs)');
  };

  /**
   * Add another — reset form for a new achievement under the same entry date.
   * Previous achievement is already fully saved.
   */
  const handleAddAnother = () => {
    if (!synthesis) return;

    // Update name if edited
    if (achievementName !== synthesis.ai_generated_name && savedAchievementId) {
      supabase
        .from('professional_achievements')
        .update({ ai_generated_name: achievementName })
        .eq('achievement_id', savedAchievementId)
        .then(({ error }) => {
          if (error) console.error('[NewEntry] Name update failed:', error);
        });
    }

    invalidateQueries();

    // Reset form state
    setMainInput('');
    setStarInputs({});
    setSynthesis(null);
    setAchievementName('');
    setSavedEntryId(null);
    setSavedAchievementId(null);
    setSynthesisError(false);
    setStep('input');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Close button */}
      {step !== 'processing' && !synthesisError && (
        <View style={styles.topBar}>
          <CloseButton onPress={() => router.replace('/(tabs)')} />
          <Text style={styles.topTitle}>
            {step === 'input' ? 'New Entry' : 'Review'}
          </Text>
          <View style={{ width: 32 }} />
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

      {step === 'processing' && !synthesisError && <ProcessingStep />}

      {step === 'processing' && synthesisError && (
        <SynthesisErrorView onRetry={handleRetry} onSkip={handleSkip} />
      )}

      {step === 'review' && synthesis && (
        <ReviewStep
          synthesis={synthesis}
          projectId={selectedProjectId}
          onProjectSelect={setSelectedProjectId}
          onSave={handleSave}
          onAddAnother={handleAddAnother}
          saving={false}
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
