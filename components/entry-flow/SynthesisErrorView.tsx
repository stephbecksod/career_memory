import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';

interface SynthesisErrorViewProps {
  onRetry: () => void;
  onSkip: () => void;
}

export function SynthesisErrorView({ onRetry, onSkip }: SynthesisErrorViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <FontAwesome name="exclamation-circle" size={32} color={colors.danger} />
      </View>

      <Text style={styles.title}>Synthesis couldn't complete</Text>
      <Text style={styles.message}>
        Something went wrong generating your synthesis. Your entry has been saved safely.
      </Text>

      <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.85}>
        <FontAwesome name="refresh" size={14} color={colors.white} style={styles.retryIcon} />
        <Text style={styles.retryText}>Try again</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.7}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.dangerFaint,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: colors.walnut,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.umber,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.moss,
    borderRadius: layout.borderRadius.md,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 12,
  },
  retryIcon: {
    marginRight: 8,
  },
  retryText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: colors.white,
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: colors.umber,
  },
});
