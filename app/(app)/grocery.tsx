import React, { useState, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHouseholdStore } from '../../src/store/householdStore';
import { useAuthStore } from '../../src/store/authStore';
import ItemTile from '../../src/components/ItemTile';
import AddItemSheet from '../../src/components/AddItemSheet';
import { CATEGORY_META, type ItemCategory } from '../../src/models/types';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../src/theme/colors';

const ALL_CATEGORIES: ItemCategory[] = ['vegetables', 'dairy', 'toiletries', 'medical', 'grocery', 'other'];

export default function GroceryScreen() {
  const [filter, setFilter] = useState<ItemCategory | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);

  const household = useHouseholdStore((s) => s.household);
  const items = useHouseholdStore((s) => s.items);
  const addItem = useHouseholdStore((s) => s.addItem);
  const markBought = useHouseholdStore((s) => s.markBought);
  const markPending = useHouseholdStore((s) => s.markPending);
  const deleteItem = useHouseholdStore((s) => s.deleteItem);
  const user = useAuthStore((s) => s.user);

  const pendingItems = items.filter(
    (i) => i.status === 'pending' && (filter === null || i.category === filter)
  );
  const boughtItems = items.filter(
    (i) => i.status === 'bought' && (filter === null || i.category === filter)
  );

  const handleToggle = (itemId: string) => {
    const item = items.find((i) => i.itemId === itemId);
    if (!item) return;
    if (item.status === 'pending') {
      markBought(itemId, user?.uid ?? 'u1', user?.displayName ?? 'You');
    } else {
      markPending(itemId);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>🏡 {household.familyName}</Text>
          <Text style={styles.headerSub}>Shared Real-Time Pantry List</Text>
        </View>
        <TouchableOpacity style={styles.addIconBtn} onPress={() => setShowAddSheet(true)}>
          <Ionicons name="add-circle" size={30} color={Colors.primaryEmerald} />
        </TouchableOpacity>
      </View>

      {/* Category Filter Pills */}
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[null, ...ALL_CATEGORIES]}
          keyExtractor={(item) => item ?? 'all'}
          renderItem={({ item: cat }) => {
            const isSelected = filter === cat;
            const meta = cat ? CATEGORY_META[cat] : null;
            return (
              <TouchableOpacity
                style={[styles.pill, isSelected && styles.pillActive]}
                onPress={() => setFilter(cat)}
              >
                {meta && <Text style={styles.pillEmoji}>{meta.emoji}</Text>}
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                  {cat ? CATEGORY_META[cat].label : 'All Items'}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        />
      </View>

      {/* Items List */}
      <FlatList
        data={[
          { type: 'section', title: `Pending (${pendingItems.length})` } as any,
          ...pendingItems.map((i) => ({ type: 'item', data: i })),
          ...(boughtItems.length > 0
            ? [
                { type: 'section', title: `Bought (${boughtItems.length})` } as any,
                ...boughtItems.map((i) => ({ type: 'item', data: i })),
              ]
            : []),
        ]}
        keyExtractor={(row, idx) =>
          row.type === 'item' ? row.data.itemId : `section-${idx}`
        }
        renderItem={({ item: row }) => {
          if (row.type === 'section') {
            return <Text style={styles.sectionLabel}>{row.title}</Text>;
          }
          return (
            <ItemTile
              item={row.data}
              onToggle={handleToggle}
              onDelete={deleteItem}
            />
          );
        }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyTitle}>List is empty!</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to add grocery items.{'\n'}
              Type in Urdu, Roman Urdu, or English.
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowAddSheet(true)}>
              <Text style={styles.emptyBtnText}>+ Add First Item</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddSheet(true)} activeOpacity={0.85}>
        <Ionicons name="add-shopping-cart-outline" size={22} color="#fff" />
        <Text style={styles.fabText}>Quick Add Item</Text>
      </TouchableOpacity>

      {/* Add Item Modal */}
      <Modal
        visible={showAddSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddSheet(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setShowAddSheet(false)}
        />
        <AddItemSheet
          onAdd={(parsed) => addItem(parsed, user?.displayName ?? 'You', user?.uid ?? 'u1')}
          onClose={() => setShowAddSheet(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.base, fontFamily: 'Inter_700Bold', color: Colors.textDark },
  headerSub: { fontSize: FontSize.xs, color: Colors.textMuted, fontFamily: 'Inter_400Regular', marginTop: 2 },
  addIconBtn: { padding: 4 },
  filterBar: { backgroundColor: Colors.surface, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.grey100,
    gap: 5,
  },
  pillActive: { backgroundColor: `${Colors.primaryEmerald}18`, borderWidth: 1.5, borderColor: Colors.primaryEmerald },
  pillEmoji: { fontSize: 14 },
  pillText: { fontSize: FontSize.sm, fontFamily: 'Inter_600SemiBold', color: Colors.textMuted },
  pillTextActive: { color: Colors.primaryEmerald },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontFamily: 'Inter_900Black',
    color: Colors.grey400,
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  list: { padding: 16, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: FontSize.xl, fontFamily: 'Inter_700Bold', color: Colors.textDark, marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, fontFamily: 'Inter_400Regular', marginBottom: 24 },
  emptyBtn: { backgroundColor: Colors.primaryEmerald, paddingHorizontal: 24, paddingVertical: 13, borderRadius: Radius.md },
  emptyBtnText: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: FontSize.base },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    left: 20,
    backgroundColor: Colors.primaryEmerald,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: Radius.lg,
    gap: 10,
    ...Shadow.lg,
  },
  fabText: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: FontSize.base },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
});
