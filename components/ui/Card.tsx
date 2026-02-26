import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accentPosition?: 'left' | 'top' | 'none';
  accentColor?: string;
}

export function Card({
  children,
  style,
  accentPosition = 'none',
  accentColor = colors.moss,
}: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {accentPosition === 'left' && (
        <View style={[styles.leftAccent, { backgroundColor: accentColor }]} />
      )}
      {accentPosition === 'top' && (
        <View style={[styles.topAccent, { backgroundColor: accentColor }]} />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    ...layout.shadow.sm,
  },
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: layout.accentBar.width,
    borderTopLeftRadius: layout.borderRadius.lg,
    borderBottomLeftRadius: layout.borderRadius.lg,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: layout.accentBar.width,
    borderTopLeftRadius: layout.borderRadius.lg,
    borderTopRightRadius: layout.borderRadius.lg,
  },
});
