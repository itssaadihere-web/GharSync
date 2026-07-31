import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { parse } from '../services/ruleBasedParser';
import { CATEGORY_META, type ItemCategory } from '../models/types';
import { Colors, Radius, FontSize, Spacing } from '../theme/colors';

interface Props {
  onAdd: (parsed: ReturnType<typeof parse>) => void;
  onClose: () => void;
}

const QUICK_ADDS = [
  '2 kg Aloo', '1 liter Doodh', 'Surf Excel', 'Anda dozen',
  'Atta 5 kg', 'Dahi 500g', 'Sabun', 'Panadol',
];

export default function AddItemSheet({ onAdd, onClose }: Props) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<ReturnType<typeof parse> | null>(null);
  const inputRef = useRef<TextInput>(null);

  const handleChange = (val: string) => {
    setText(val);
    if (val.trim().length > 1) {
      setPreview(parse(val));
    } else {
      setPreview(null);
    }
  };

  const handleAdd = () => {
    const result = parse(text);
    if (!result.itemName.trim()) return;
    onAdd(result);
    setText('');
    setPreview(null);
    onClose();
  };

  const handleQuickAdd = (q: string) => {
    const result = parse(q);
    onAdd(result);
    onClose();
  };

  const meta = preview ? CATEGORY_META[preview.category] : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.wrapper}
    >
      {/* Handle bar */}
      <View style={styles.handle} />

      <Text style={styles.title}>Add Grocery Item</Text>
      <Text style={styles.subtitle}>
        Type in Urdu, Roman Urdu, or English
      </Text>

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={handleChange}
          placeholder='e.g. "2 kilo aloo" or "دودھ 1 لیٹر"'
          placeholderTextColor={Colors.grey400}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity
          style={[styles.addBtn, !text.trim() && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={!text.trim()}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Live Preview */}
      {preview && preview.itemName && (
        <View style={styles.preview}>
          <Text style={styles.previewEmoji}>{meta?.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.previewName}>{preview.itemName}</Text>
            <Text style={styles.previewMeta}>
              {preview.quantity} {preview.unit} · {meta?.label}
            </Text>
          </View>
          <View style={styles.previewBadge}>
            <Text style={styles.previewBadgeText}>Parsed ✓</Text>
          </View>
        </View>
      )}

      {/* Quick Add Chips */}
      <Text style={styles.sectionLabel}>QUICK ADD</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {QUICK_ADDS.map((q) => (
          <TouchableOpacity key={q} style={styles.chip} onPress={() => handleQuickAdd(q)}>
            <Text style={styles.chipEmoji}>{CATEGORY_META[parse(q).category].emoji}</Text>
            <Text style={styles.chipText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.grey200,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.grey50,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primaryEmerald,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: FontSize.base,
    color: Colors.textDark,
  },
  addBtn: {
    backgroundColor: Colors.primaryEmerald,
    width: 50,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    backgroundColor: Colors.grey300,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  previewEmoji: { fontSize: 28 },
  previewName: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  previewMeta: {
    fontSize: FontSize.sm,
    color: Colors.primaryEmerald,
  },
  previewBadge: {
    backgroundColor: Colors.primaryEmerald,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  previewBadgeText: {
    color: '#fff',
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '900',
    color: Colors.grey400,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  chips: { marginBottom: 20 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grey100,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    gap: 6,
  },
  chipEmoji: { fontSize: 16 },
  chipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textDark },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    color: Colors.textMuted,
    fontSize: FontSize.base,
  },
});
