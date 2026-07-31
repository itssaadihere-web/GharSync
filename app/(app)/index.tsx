import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHouseholdStore } from '../../src/store/householdStore';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, FontSize, Radius, Shadow } from '../../src/theme/colors';
import { formatDistanceToNow } from 'date-fns';
import type { Group } from '../../src/models/types';

function GroupRow({ group }: { group: Group }) {
  const clearUnread = useHouseholdStore((s) => s.clearUnread);

  const handlePress = () => {
    clearUnread(group.groupId);
    router.push(`/(app)/group/${group.groupId}`);
  };

  const timeAgo = formatDistanceToNow(group.lastTime, { addSuffix: true });

  return (
    <TouchableOpacity style={styles.row} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.avatarEmoji}>{group.avatar}</Text>
        {group.unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{group.unreadCount}</Text>
          </View>
        )}
      </View>
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={styles.groupName} numberOfLines={1}>{group.groupName}</Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
        <View style={styles.rowBottom}>
          <Text style={styles.lastMsg} numberOfLines={1}>{group.lastMessage}</Text>
          <Text style={styles.memberCount}>👥 {group.memberCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatsScreen() {
  const groups = useHouseholdStore((s) => s.groups);
  const user = useAuthStore((s) => s.user);

  return (
    <SafeAreaView style={styles.container}>
      {/* WhatsApp-style header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>GharSync</Text>
          <Text style={styles.headerSub}>👤 {user?.displayName}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/paywall')} style={styles.headerBtn}>
            <Ionicons name="star" size={22} color="#FFD700" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="search" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Groups List */}
      <FlatList
        data={groups}
        keyExtractor={(g) => g.groupId}
        renderItem={({ item }) => <GroupRow group={item} />}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={() => (
          <Text style={styles.sectionLabel}>YOUR GROUPS & HOUSEHOLDS</Text>
        )}
      />

      {/* FAB: Create Group */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Ionicons name="add-circle" size={28} color="#fff" />
        <Text style={styles.fabText}>New Group</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.whatsappGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
  },
  headerTitle: { fontSize: FontSize.xl, fontFamily: 'Inter_700Bold', color: '#fff' },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_400Regular', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: { padding: 6 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_900Black',
    color: Colors.grey400,
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  list: { paddingBottom: 100 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    position: 'relative',
  },
  avatarEmoji: { fontSize: 28 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.primaryEmerald,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 10, fontFamily: 'Inter_700Bold' },
  rowContent: { flex: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  groupName: { fontSize: FontSize.base, fontFamily: 'Inter_700Bold', color: Colors.textDark, flex: 1 },
  time: { fontSize: FontSize.xs, color: Colors.textMuted, fontFamily: 'Inter_400Regular', marginLeft: 8 },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMsg: { fontSize: FontSize.sm, color: Colors.textMuted, fontFamily: 'Inter_400Regular', flex: 1 },
  memberCount: { fontSize: FontSize.xs, color: Colors.grey400 },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 82 },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: Colors.primaryEmerald,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: Radius.full,
    gap: 8,
    ...Shadow.lg,
  },
  fabText: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: FontSize.sm },
});
