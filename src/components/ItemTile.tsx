import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ListItem } from '../models/types';
import { CATEGORY_META } from '../models/types';
import { Colors, Radius, FontSize, Shadow } from '../theme/colors';

interface Props {
  item: ListItem;
  isShoppingMode?: boolean;
  onToggle: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

export default function ItemTile({ item, isShoppingMode = false, onToggle, onDelete }: Props) {
  const isBought = item.status === 'bought';
  const meta = CATEGORY_META[item.category];

  const handleDelete = () => {
    Alert.alert(
      'Remove Item',
      `Remove "${item.itemName}" from the list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onDelete(item.itemId) },
      ]
    );
  };

  const qtyDisplay =
    item.quantity % 1 === 0
      ? `${item.quantity.toFixed(0)} ${item.unit}`
      : `${item.quantity} ${item.unit}`;

  return (
    <View style={[styles.container, isBought && styles.containerBought, Shadow.sm]}>
      {/* Left: Category Circle / Check */}
      <TouchableOpacity
        style={[
          styles.categoryCircle,
          isShoppingMode && styles.categoryCircleLarge,
          isBought && styles.categoryCircleBought,
        ]}
        onPress={() => onToggle(item.itemId)}
        activeOpacity={0.7}
      >
        {isBought ? (
          <Ionicons name="checkmark" size={isShoppingMode ? 28 : 22} color="#fff" />
        ) : (
          <Text style={{ fontSize: isShoppingMode ? 26 : 20 }}>{meta.emoji}</Text>
        )}
      </TouchableOpacity>

      {/* Middle: Name + Meta */}
      <TouchableOpacity
        style={styles.content}
        onPress={() => onToggle(item.itemId)}
        activeOpacity={0.7}
      >
        <View style={styles.nameRow}>
          <Text
            style={[
              styles.itemName,
              isShoppingMode && styles.itemNameLarge,
              isBought && styles.itemNameBought,
            ]}
            numberOfLines={1}
          >
            {item.itemName}
          </Text>
          <View style={[styles.qtyBadge, isBought && styles.qtyBadgeBought]}>
            <Text style={[styles.qtyText, isBought && styles.qtyTextBought]}>
              {qtyDisplay}
            </Text>
          </View>
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {isBought && item.boughtBy
            ? `✓ Bought by ${item.boughtBy.name}`
            : `Added by ${item.addedBy.name} · ${meta.label}`}
        </Text>
      </TouchableOpacity>

      {/* Right: Delete */}
      <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="trash-outline" size={18} color={Colors.grey400} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  containerBought: {
    backgroundColor: Colors.grey50,
    borderColor: Colors.grey200,
    opacity: 0.8,
  },
  categoryCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: `${Colors.primaryEmerald}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryCircleLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  categoryCircleBought: {
    backgroundColor: Colors.primaryEmerald,
  },
  content: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  itemName: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: Colors.textDark,
    flex: 1,
    marginRight: 8,
  },
  itemNameLarge: {
    fontSize: FontSize.lg,
  },
  itemNameBought: {
    textDecorationLine: 'line-through',
    color: Colors.grey400,
  },
  qtyBadge: {
    backgroundColor: `${Colors.primaryEmerald}14`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  qtyBadgeBought: {
    backgroundColor: Colors.grey100,
  },
  qtyText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primaryEmerald,
  },
  qtyTextBought: {
    color: Colors.grey400,
  },
  meta: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 8,
  },
});
