import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/BackButton';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { useTags } from '@/hooks/useTags';
import { useTagMutations } from '@/hooks/useTagMutations';
import { colors } from '@/constants/colors';

export default function TagsScreen() {
  const router = useRouter();
  const { data: tags, isLoading } = useTags();
  const { createTag, deleteTag } = useTagMutations();
  const [newTagName, setNewTagName] = useState('');

  const systemTags = tags?.filter((t) => t.is_system) ?? [];
  const customTags = tags?.filter((t) => !t.is_system) ?? [];

  const handleAdd = async () => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;

    try {
      await createTag.mutateAsync(trimmed);
      setNewTagName('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create tag.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    }
  };

  const handleRemove = async (tagId: string) => {
    try {
      await deleteTag.mutateAsync(tagId);
    } catch {
      // Error handled
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Tags</Text>
        <View style={{ width: 32 }} />
      </View>

      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* System tags */}
          <SectionLabel>System tags</SectionLabel>
          <View style={styles.tagWrap}>
            {systemTags.map((tag) => (
              <View key={tag.tag_id} style={styles.systemTag}>
                <Text style={styles.systemTagText}>{tag.name}</Text>
              </View>
            ))}
          </View>

          {/* Custom tags */}
          <SectionLabel style={{ marginTop: 10 }}>Your custom tags</SectionLabel>
          <View style={styles.tagWrap}>
            {customTags.map((tag) => (
              <View key={tag.tag_id} style={styles.customTag}>
                <Text style={styles.customTagText}>{tag.name}</Text>
                <TouchableOpacity
                  onPress={() => handleRemove(tag.tag_id)}
                  hitSlop={6}
                >
                  <FontAwesome name="times" size={11} color={colors.mossDeep} />
                </TouchableOpacity>
              </View>
            ))}
            {customTags.length === 0 && (
              <Text style={styles.emptyText}>No custom tags yet.</Text>
            )}
          </View>

          {/* Add tag input */}
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              value={newTagName}
              onChangeText={setNewTagName}
              placeholder="Add a custom tag..."
              placeholderTextColor={colors.umber}
              onSubmitEditing={handleAdd}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.addBtn, !newTagName.trim() && styles.addBtnDisabled]}
              onPress={handleAdd}
              disabled={!newTagName.trim() || createTag.isPending}
            >
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: colors.walnut,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 18,
  },
  systemTag: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  systemTagText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11.5,
    color: colors.walnut,
  },
  customTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.mossFaint,
    borderWidth: 1,
    borderColor: colors.mossBorder,
    borderRadius: 20,
    paddingLeft: 11,
    paddingRight: 8,
    paddingVertical: 4,
  },
  customTagText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11.5,
    color: colors.mossDeep,
  },
  emptyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.umber,
    fontStyle: 'italic',
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addInput: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.walnut,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  addBtn: {
    backgroundColor: colors.moss,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
    justifyContent: 'center',
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  addBtnText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: colors.white,
  },
});
