import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface LoadingIndicatorProps {
  fullScreen?: boolean;
  size?: 'small' | 'large';
}

export function LoadingIndicator({ fullScreen = false, size = 'large' }: LoadingIndicatorProps) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={colors.moss} />
      </View>
    );
  }

  return <ActivityIndicator size={size} color={colors.moss} />;
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
});
