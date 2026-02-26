import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';

interface TagProps {
  label: string;
  variant?: 'filled' | 'dashed' | 'removable';
  onPress?: () => void;
  onRemove?: () => void;
}

export function Tag({ label, variant = 'filled', onPress, onRemove }: TagProps) {
  const isRemovable = variant === 'removable';
  const isDashed = variant === 'dashed';

  const content = (
    <View
      style={[
        styles.pill,
        isDashed && styles.dashedPill,
        !isDashed && styles.filledPill,
      ]}
    >
      {isDashed && <Text style={styles.dashedPlus}>+ </Text>}
      <Text style={[styles.label, isDashed && styles.dashedLabel]}>
        {label}
      </Text>
      {isRemovable && (
        <TouchableOpacity onPress={onRemove} hitSlop={8} style={styles.removeBtn}>
          <FontAwesome name="times" size={10} color={colors.umber} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPress && !isRemovable) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: layout.spacing.xs,
    marginBottom: layout.spacing.xs,
  },
  filledPill: {
    backgroundColor: colors.mossFaint,
    borderWidth: 1,
    borderColor: colors.mossBorder,
  },
  dashedPill: {
    borderWidth: 1,
    borderColor: colors.mossBorder,
    borderStyle: 'dashed',
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: colors.moss,
  },
  dashedLabel: {
    color: colors.umber,
  },
  dashedPlus: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: colors.moss,
  },
  removeBtn: {
    marginLeft: 6,
  },
});
