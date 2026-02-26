import { Text, StyleSheet, type TextStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface SectionLabelProps {
  children: string;
  style?: TextStyle;
}

export function SectionLabel({ children, style }: SectionLabelProps) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    color: colors.umber,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
});
