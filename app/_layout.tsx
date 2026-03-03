import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import {
  DMSans_400Regular,
  DMSans_500Medium,
} from '@expo-google-fonts/dm-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/lib/supabase';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
  });

  const { initialize, initialized, loading, setSession, fetchProfile, clear } = useUserStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      // Only fetch profile on sign-in or initial session — not on TOKEN_REFRESHED
      // Token refresh events trigger frequently and cause redundant (often hanging) queries
      if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        await fetchProfile(session.user.id);
      } else if (!session) {
        clear();
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, fetchProfile, clear]);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded && initialized) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, initialized]);

  if (!fontsLoaded || loading) {
    return null;
  }

  const rootContent = (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="entry" />
      <Stack.Screen name="achievement" />
      <Stack.Screen name="project" />
      <Stack.Screen name="settings" />
    </Stack>
  );

  return (
    <QueryClientProvider client={queryClient}>
      {Platform.OS === 'web' ? (
        <View style={{ height: '100vh' as any, overflow: 'hidden' }}>
          {rootContent}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {rootContent}
        </View>
      )}
    </QueryClientProvider>
  );
}
