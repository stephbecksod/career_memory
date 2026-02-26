import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { Button } from './Button';

interface EmptyStateProps {
  message: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
}

export function EmptyState({ message, ctaLabel, onCtaPress }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {ctaLabel && onCtaPress && (
        <Button
          title={ctaLabel}
          onPress={onCtaPress}
          style={styles.cta}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: layout.spacing.xxl,
    alignItems: 'center',
  },
  message: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.umber,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  cta: {
    marginTop: layout.spacing.lg,
  },
});
