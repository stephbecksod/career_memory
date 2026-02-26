import { Tabs } from 'expo-router';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/colors';

function TabIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={22} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.moss,
        tabBarInactiveTintColor: colors.umber,
        tabBarStyle: {
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
}
