import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        isPrimary && styles.primary,
        variant === 'secondary' && styles.secondary,
        isDanger && styles.danger,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary || isDanger ? colors.white : colors.moss}
        />
      ) : (
        <Text
          style={[
            styles.label,
            isPrimary && styles.primaryLabel,
            variant === 'secondary' && styles.secondaryLabel,
            isDanger && styles.dangerLabel,
            disabled && styles.disabledLabel,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: layout.borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  primary: {
    backgroundColor: colors.moss,
  },
  secondary: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.mossBorder,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    backgroundColor: colors.umber,
    borderColor: colors.transparent,
    opacity: 0.5,
  },
  label: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
  },
  primaryLabel: {
    color: colors.white,
  },
  secondaryLabel: {
    color: colors.moss,
  },
  dangerLabel: {
    color: colors.white,
  },
  disabledLabel: {
    color: colors.white,
  },
});
