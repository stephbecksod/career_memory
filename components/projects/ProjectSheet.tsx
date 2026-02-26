import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { Button } from '@/components/ui/Button';

interface ProjectSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => void;
  initialName?: string;
  initialDescription?: string;
}

export function ProjectSheet({
  visible,
  onClose,
  onSave,
  initialName = '',
  initialDescription = '',
}: ProjectSheetProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  const handleSave = () => {
    if (name.trim().length === 0) return;
    onSave(name.trim(), description.trim() || undefined);
    setName('');
    setDescription('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>New Project</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Project name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Q1 Platform Migration"
            placeholderTextColor={colors.umber}
            autoFocus
          />

          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.descInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="What's this project about?"
            placeholderTextColor={colors.umber}
            multiline
            textAlignVertical="top"
          />

          <Button
            title="Create Project"
            onPress={handleSave}
            disabled={name.trim().length === 0}
            style={styles.saveBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: colors.walnut,
  },
  cancelText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: colors.umber,
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: colors.umber,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: layout.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.walnut,
  },
  descInput: {
    minHeight: 70,
  },
  saveBtn: {
    marginTop: 24,
  },
});
