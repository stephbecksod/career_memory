import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import type { ProcessingStage } from '@/types/app';

const STAGES: ProcessingStage[] = [
  'Reading your entry…',
  'Identifying achievements…',
  'Building your synthesis…',
  'Finalizing…',
];

interface ProcessingStepProps {
  currentStage?: number;
}

export function ProcessingStep({ currentStage: externalStage }: ProcessingStepProps) {
  const [stageIndex, setStageIndex] = useState(externalStage ?? 0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.7, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [scale, opacity]);

  // Auto-advance stages
  useEffect(() => {
    if (externalStage !== undefined) return;
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 800);
    return () => clearInterval(interval);
  }, [externalStage]);

  const activeStage = externalStage ?? stageIndex;

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.orbWrapper, orbStyle]}>
        <LinearGradient
          colors={['#4A6642', '#5C7A52']}
          style={styles.orb}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Text style={styles.stageText}>{STAGES[activeStage]}</Text>

      <View style={styles.dots}>
        {STAGES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i <= activeStage && styles.dotActive,
              i === activeStage && styles.dotCurrent,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  orbWrapper: {
    marginBottom: 40,
  },
  orb: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  stageText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: colors.walnut,
    marginBottom: 24,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.divider,
  },
  dotActive: {
    backgroundColor: colors.moss,
  },
  dotCurrent: {
    width: 20,
    borderRadius: 4,
  },
});
