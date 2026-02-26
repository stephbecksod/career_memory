import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { useProjects } from '@/hooks/useProjects';
import { ProjectListCard } from '@/components/projects/ProjectListCard';
import { ProjectSheet } from '@/components/projects/ProjectSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { PROJECT_STATUS } from '@/constants/app';

type FilterStatus = 'all' | 'active' | 'completed';

export default function ProjectsScreen() {
  const { data: projects, isLoading, createProject } = useProjects();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [showNewProject, setShowNewProject] = useState(false);

  const filtered = (projects ?? []).filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const FILTERS: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => setShowNewProject(true)}
        >
          <Text style={styles.newButtonText}>New project</Text>
        </TouchableOpacity>
      </View>

      {/* Filter pills */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterPill, filter === f.key && styles.filterActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {isLoading ? (
        <LoadingIndicator fullScreen />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.project_id}
          renderItem={({ item }) => <ProjectListCard project={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              message="Create a project and tag achievements to it to see your project summary."
              ctaLabel="New Project"
              onCtaPress={() => setShowNewProject(true)}
            />
          }
        />
      )}

      <ProjectSheet
        visible={showNewProject}
        onClose={() => setShowNewProject(false)}
        onSave={async (name, description) => {
          await createProject.mutateAsync({ name, description });
          setShowNewProject(false);
        }}
      />
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
  newButton: {
    backgroundColor: colors.mossFaint,
    borderRadius: layout.borderRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  newButtonText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.moss,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  filterActive: {
    backgroundColor: colors.mossFaint,
    borderColor: colors.mossBorder,
  },
  filterText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: colors.umber,
  },
  filterTextActive: {
    color: colors.moss,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
});
