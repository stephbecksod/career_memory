import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useUserStore } from '@/stores/userStore';
import { colors } from '@/constants/colors';

export default function Index() {
  const { session, initialized } = useUserStore();

  if (!initialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.moss} />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
});
