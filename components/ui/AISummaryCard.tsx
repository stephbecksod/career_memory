import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { layout } from '@/constants/layout';

interface AISummaryCardProps {
  text: string;
}

export function AISummaryCard({ text }: AISummaryCardProps) {
  return (
    <LinearGradient
      colors={['#4A6642', '#5C7A52']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.gradient}
    >
      <Text style={styles.label}>AI SUMMARY</Text>
      <Text style={styles.text}>{text}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: layout.borderRadius.lg,
    padding: layout.spacing.lg,
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  text: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12.5,
    color: '#FFFFFF',
    lineHeight: 12.5 * 1.65,
  },
});
