import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { useEntries } from '@/hooks/useEntries';
import { useAchievements } from '@/hooks/useAchievements';
import { EntryCard } from '@/components/entries/EntryCard';
import { AchievementCard } from '@/components/achievements/AchievementCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import type { EntriesViewMode } from '@/types/app';

export default function EntriesScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<EntriesViewMode>('by_entry');
  const { data: entries, isLoading: entriesLoading } = useEntries();
  const { data: achievements, isLoading: achievementsLoading } = useAchievements();

  const isLoading = entriesLoading || achievementsLoading;

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
          renderItem={({ item }) => <AchievementCard achievement={item} />}
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
    fontSize: 28,
    color: colors.walnut,
  },
  addButton: {
    backgroundColor: colors.mossFaint,
    borderRadius: layout.borderRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addButtonText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.moss,
  },
  toggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 3,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleActive: {
    backgroundColor: colors.mossFaint,
  },
  toggleText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: colors.umber,
  },
  toggleTextActive: {
    color: colors.moss,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
});
