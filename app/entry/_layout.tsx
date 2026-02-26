import { Stack } from 'expo-router';

export default function EntryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'fullScreenModal',
        animation: 'slide_from_bottom',
      }}
    />
  );
}
