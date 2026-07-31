import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHouseholdStore } from '../../src/store/householdStore';
import { useAuthStore } from '../../src/store/authStore';
import { CATEGORY_META } from '../../src/models/types';
import { Colors, FontSize, Radius, Shadow } from '../../src/theme/colors';
import type { ListItem } from '../../src/models/types';

function ShoppingCard({ item, onToggle }: { item: ListItem; onToggle: (id: string) => void }) {
  const meta = CATEGORY_META[item.category];
  const isBought = item.status === 'bought';

  return (
    <TouchableOpacity
      style={[styles.card, isBought && styles.cardBought]}
      onPress={() => onToggle(item.itemId)}
      activeOpacity={0.75}
    >
      {/* Big emoji / checkmark */}
      <View style={[styles.emojiBox, isBought && styles.emojiBoxBought]}>
        <Text style={styles.emoji}>
          {isBought ? '✅' : meta.emoji}
        </Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={[styles.cardName, isBought && styles.cardNameBought]} numberOfLines={1}>
          {item.itemName}
        </Text>
        <Text style={styles.cardQty}>
          {item.quantity % 1 === 0 ? item.quantity.toFixed(0) : item.quantity} {item.unit}
        </Text>
        {isBought && item.boughtBy && (
          <Text style={styles.cardBoughtBy}>✓ {item.boughtBy.name}</Text>
        )}
      </View>

      <View style={[styles.checkCircle, isBought && styles.checkCircleActive]}>
        <Ionicons
          name={isBought ? 'checkmark' : 'ellipse-outline'}
          size={26}
          color={isBought ? '#fff' : Colors.grey300}
        />
      </View>
    </TouchableOpacity>
  );
}

export default function ShoppingModeScreen() {
  const items = useHouseholdStore((s) => s.items);
  const markBought = useHouseholdStore((s) => s.markBought);
  const markPending = useHouseholdStore((s) => s.markPending);
  const user = useAuthStore((s) => s.user);

  const pending = items.filter((i) => i.status === 'pending');
  const bought = items.filter((i) => i.status === 'bought');
  const progress = items.length > 0 ? bought.length / items.length : 0;

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
        <Text style={styles.headerTitle}>🛍️ Shopping Mode</Text>
        <Text style={styles.headerSub}>Tap items to mark as bought</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {bought.length} of {items.length} items bought
          </Text>
          <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
        </View>
        {progress === 1 && items.length > 0 && (
          <Text style={styles.doneText}>🎉 All done! Great job!</Text>
        )}
      </View>

      {/* Items Grid */}
      <FlatList
        data={[...pending, ...bought]}
        keyExtractor={(i) => i.itemId}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={{ flex: 1, padding: 6 }}>
            <ShoppingCard item={item} onToggle={handleToggle} />
          </View>
        )}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>🛒</Text>
            <Text style={styles.emptyText}>No items in the list yet!</Text>
            <Text style={styles.emptySubText}>Go to Grocery tab to add items.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 16, paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.xl, fontFamily: 'Inter_700Bold', color: Colors.textDark },
  headerSub: { fontSize: FontSize.sm, color: Colors.textMuted, fontFamily: 'Inter_400Regular', marginTop: 2 },
  progressContainer: {
    margin: 16,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 16,
    ...Shadow.sm,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { fontSize: FontSize.sm, fontFamily: 'Inter_600SemiBold', color: Colors.textMedium },
  progressPct: { fontSize: FontSize.sm, fontFamily: 'Inter_700Bold', color: Colors.primaryEmerald },
  progressBar: { height: 8, backgroundColor: Colors.grey100, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primaryEmerald, borderRadius: 4 },
  doneText: { marginTop: 8, textAlign: 'center', fontSize: FontSize.base, fontFamily: 'Inter_700Bold', color: Colors.primaryEmerald },
  grid: { padding: 10, paddingBottom: 80 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  cardBought: {
    backgroundColor: Colors.grey50,
    borderColor: Colors.grey200,
    opacity: 0.8,
  },
  emojiBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.primaryEmerald}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emojiBoxBought: { backgroundColor: `${Colors.primaryEmerald}20` },
  emoji: { fontSize: 34 },
  cardContent: { alignItems: 'center', flex: 1, width: '100%' },
  cardName: { fontSize: FontSize.base, fontFamily: 'Inter_700Bold', color: Colors.textDark, textAlign: 'center' },
  cardNameBought: { textDecorationLine: 'line-through', color: Colors.grey400 },
  cardQty: { fontSize: FontSize.sm, color: Colors.primaryEmerald, fontFamily: 'Inter_600SemiBold', marginTop: 3 },
  cardBoughtBy: { fontSize: FontSize.xs, color: Colors.primaryEmerald, fontFamily: 'Inter_400Regular', marginTop: 3 },
  checkCircle: {
    marginTop: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.grey200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: { backgroundColor: Colors.primaryEmerald, borderColor: Colors.primaryEmerald },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: FontSize.lg, fontFamily: 'Inter_700Bold', color: Colors.textDark },
  emptySubText: { fontSize: FontSize.sm, color: Colors.textMuted, fontFamily: 'Inter_400Regular' },
});
