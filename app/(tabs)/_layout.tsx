import { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { Tabs, useRouter } from 'expo-router';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useUserStore } from '@/stores/userStore';
import { colors } from '@/constants/colors';
import Sidebar from '@/components/navigation/Sidebar';

const isWeb = Platform.OS === 'web';

function TabIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={22} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const router = useRouter();
  const session = useUserStore((s) => s.session);
  const profile = useUserStore((s) => s.profile);

  useEffect(() => {
    // Redirect to onboarding if user hasn't completed it
    if (session && profile && profile.onboarding_complete === false) {
      router.replace('/(auth)/onboarding');
    }
  }, [session, profile, router]);

  const tabs = (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.moss,
        tabBarInactiveTintColor: colors.umber,
        tabBarStyle: isWeb
          ? { display: 'none' as const }
          : {
              backgroundColor: colors.card,
              borderTopColor: colors.cardBorder,
              height: 60,
              paddingBottom: 8,
              paddingTop: 4,
            },
        headerStyle: {
          backgroundColor: colors.bg,
        },
        headerTintColor: colors.walnut,
        headerTitleStyle: {
          fontFamily: 'Nunito_700Bold',
        },
        headerShadowVisible: false,
        ...(isWeb && { headerShown: false }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: 'Summary',
          tabBarIcon: ({ color }) => <TabIcon name="file-text-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="entries"
        options={{
          title: 'Entries',
          tabBarIcon: ({ color }) => <TabIcon name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color }) => <TabIcon name="folder-o" color={color} />,
        }}
      />
    </Tabs>
  );

  if (isWeb) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', height: '100%' as any }}>
        <Sidebar />
        <View style={{ flex: 1, overflow: 'hidden' }}>
          {tabs}
        </View>
      </View>
    );
  }

  return tabs;
}
