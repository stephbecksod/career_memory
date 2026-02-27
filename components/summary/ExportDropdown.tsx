import { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Clipboard from 'expo-clipboard';
import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';

interface ExportDropdownProps {
  getAllText: () => string;
  onCopied: () => void;
}

const EXPORT_OPTIONS = [
  { label: 'Copy all', soon: false },
  { label: 'Copy for LinkedIn', soon: true },
  { label: 'Export .docx', soon: true },
  { label: 'Export PDF', soon: true },
];

export function ExportDropdown({ getAllText, onCopied }: ExportDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleCopyAll = async () => {
    try {
      const text = getAllText();
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(text);
      } else {
        await Clipboard.setStringAsync(text);
      }
      onCopied();
    } catch {
      // Silently fail
    }
    setOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
        style={[styles.trigger, open && styles.triggerOpen]}
      >
        <FontAwesome
          name="share-square-o"
          size={12}
          color={open ? colors.white : colors.umber}
        />
        <Text style={[styles.triggerText, open && styles.triggerTextOpen]}>
          Export
        </Text>
        <FontAwesome
          name={open ? 'chevron-up' : 'chevron-down'}
          size={8}
          color={open ? colors.white : colors.umber}
        />
      </TouchableOpacity>

      {open && (
        <>
          {/* Backdrop to close menu */}
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setOpen(false)}
          />
          <View style={styles.dropdown}>
            {EXPORT_OPTIONS.map((opt, i) => (
              <TouchableOpacity
                key={opt.label}
                onPress={() => {
                  if (!opt.soon) handleCopyAll();
                }}
                activeOpacity={opt.soon ? 1 : 0.7}
                style={[
                  styles.option,
                  i < EXPORT_OPTIONS.length - 1 && styles.optionBorder,
                ]}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    opt.soon && styles.optionLabelSoon,
                  ]}
                >
                  {opt.label}
                </Text>
                {opt.soon && <Text style={styles.soonBadge}>Soon</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 20,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 9,
    paddingVertical: 6,
    paddingHorizontal: 11,
  },
  triggerOpen: {
    backgroundColor: colors.moss,
    borderColor: colors.moss,
  },
  triggerText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11.5,
    color: colors.umber,
  },
  triggerTextOpen: {
    color: colors.white,
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 1,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 5,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 11,
    overflow: 'hidden',
    minWidth: 178,
    zIndex: 20,
    ...layout.shadow.sm,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 13,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  optionLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12.5,
    color: colors.walnut,
  },
  optionLabelSoon: {
    fontFamily: 'DMSans_400Regular',
    color: colors.umber,
    opacity: 0.8,
  },
  soonBadge: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 9,
    color: colors.blush,
  },
});
