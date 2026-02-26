import { Text, StyleSheet, View } from 'react-native';
import { colors } from '@/constants/colors';

interface StatusBadgeProps {
  status: 'active' | 'completed' | 'archived';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isActive = status === 'active';

  return (
    <View style={[styles.pill, isActive ? styles.activePill : styles.completedPill]}>
      <Text
        style={[
          styles.label,
          isActive ? styles.activeLabel : styles.completedLabel,
          status === 'archived' && styles.archivedLabel,
        ]}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  activePill: {
    backgroundColor: colors.mossFaint,
  },
  completedPill: {
    backgroundColor: 'rgba(173,156,142,0.12)',
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
  },
  activeLabel: {
    color: colors.moss,
  },
  completedLabel: {
    color: colors.umber,
  },
  archivedLabel: {
    fontStyle: 'italic',
  },
});
