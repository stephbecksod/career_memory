import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { useProjects } from '@/hooks/useProjects';
import { ProjectSheet } from './ProjectSheet';

interface InlineProjectPickerProps {
  selectedProjectId: string | null;
  onSelect: (id: string | null) => void;
}

export function InlineProjectPicker({ selectedProjectId, onSelect }: InlineProjectPickerProps) {
  const [open, setOpen] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const { data: projects, createProject } = useProjects();

  const selected = projects?.find((p) => p.project_id === selectedProjectId);

  if (selected && !open) {
    return (
      <View style={styles.selectedRow}>
        <TouchableOpacity
          style={styles.selectedPill}
          onPress={() => setOpen(true)}
        >
          <FontAwesome name="folder-o" size={13} color={colors.moss} />
          <Text style={styles.selectedName} numberOfLines={1}>{selected.name}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onSelect(null)} hitSlop={8}>
          <FontAwesome name="times" size={14} color={colors.umber} />
        </TouchableOpacity>
      </View>
    );
  }

  if (!open) {
    return (
      <TouchableOpacity style={styles.emptyPill} onPress={() => setOpen(true)}>
        <Text style={styles.emptyText}>Add to project</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.dropdown}>
      <FlatList
        data={projects ?? []}
        keyExtractor={(item) => item.project_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              onSelect(item.project_id);
              setOpen(false);
            }}
          >
            <FontAwesome name="folder-o" size={13} color={colors.umber} />
            <Text style={styles.dropdownName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.newProjectRow}
            onPress={() => setShowNewProject(true)}
          >
            <FontAwesome name="plus" size={12} color={colors.moss} />
            <Text style={styles.newProjectText}>New project…</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <Text style={styles.noProjects}>No projects yet</Text>
        }
        style={styles.list}
      />
      <TouchableOpacity style={styles.cancelRow} onPress={() => setOpen(false)}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>

      <ProjectSheet
        visible={showNewProject}
        onClose={() => setShowNewProject(false)}
        onSave={async (name, description) => {
          const result = await createProject.mutateAsync({ name, description });
          onSelect(result.project_id);
          setShowNewProject(false);
          setOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  emptyPill: {
    borderWidth: 1,
    borderColor: colors.mossBorder,
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: colors.umber,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.mossFaint,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.mossBorder,
  },
  selectedName: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: colors.moss,
    maxWidth: 200,
  },
  dropdown: {
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 8,
    ...layout.shadow.sm,
  },
  list: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  dropdownName: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.walnut,
  },
  newProjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  newProjectText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: colors.moss,
  },
  noProjects: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.umber,
    padding: 14,
    fontStyle: 'italic',
  },
  cancelRow: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: colors.umber,
  },
});
