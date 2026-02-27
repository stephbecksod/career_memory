import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { useEntries } from '@/hooks/useEntries';
import { useAchievements } from '@/hooks/useAchievements';
import { useProjects } from '@/hooks/useProjects';
import { EntryCard } from '@/components/entries/EntryCard';
import { AchievementCard } from '@/components/achievements/AchievementCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import type { EntriesViewMode } from '@/types/app';

export default function EntriesScreen() {
  const router = useRouter();
  const { view } = useLocalSearchParams<{ view?: string }>();
  const [viewMode, setViewMode] = useState<EntriesViewMode>('by_entry');

  // Respond to navigation param (e.g. from Home stats tap)
  useEffect(() => {
    if (view === 'by_achievement') {
      setViewMode('by_achievement');
    }
  }, [view]);
  const { data: entries, isLoading: entriesLoading } = useEntries();
  const { data: achievements, isLoading: achievementsLoading } = useAchievements();
  const { data: projects } = useProjects();

  const isLoading = entriesLoading || achievementsLoading;

  // Build project name lookup
  const projectNameMap = (projects ?? []).reduce<Record<string, string>>(
    (acc, p) => {
      acc[p.project_id] = p.name;
      return acc;
    },
    {},
  );

  // Count achievements per entry
  const achievementCountByEntry = (achievements ?? []).reduce<Record<string, number>>(
    (acc, a) => {
      acc[a.entry_id] = (acc[a.entry_id] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Entries</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/entry/new')}
        >
          <FontAwesome name="plus" size={11} color={colors.white} style={{ marginRight: 5 }} />
          <Text style={styles.addButtonText}>Add new</Text>
        </TouchableOpacity>
      </View>

      {/* Toggle */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'by_entry' && styles.toggleActive]}
          onPress={() => setViewMode('by_entry')}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === 'by_entry' && styles.toggleTextActive,
            ]}
          >
            By Entry
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'by_achievement' && styles.toggleActive]}
          onPress={() => setViewMode('by_achievement')}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === 'by_achievement' && styles.toggleTextActive,
            ]}
          >
            By Achievement
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <LoadingIndicator fullScreen />
      ) : viewMode === 'by_entry' ? (
        <FlatList
          data={entries ?? []}
          keyExtractor={(item) => item.entry_id}
          renderItem={({ item }) => (
            <EntryCard
              entry={item}
              achievementCount={achievementCountByEntry[item.entry_id] ?? 0}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              message="Log your first achievement to get started."
              ctaLabel="Add Entry"
              onCtaPress={() => router.push('/entry/new')}
            />
          }
        />
      ) : (
        <FlatList
          data={achievements ?? []}
          keyExtractor={(item) => item.achievement_id}
          renderItem={({ item }) => (
            <AchievementCard
              achievement={item}
              projectName={item.project_id ? projectNameMap[item.project_id] : null}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              message="Your achievements will appear here after you log an entry."
              ctaLabel="Add Entry"
              onCtaPress={() => router.push('/entry/new')}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 24,
    color: colors.walnut,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.moss,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...layout.shadow.sm,
  },
  addButtonText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.white,
  },
  toggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 3,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: colors.moss,
  },
  toggleText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: colors.umber,
  },
  toggleTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
});
