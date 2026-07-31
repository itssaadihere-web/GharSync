import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useHouseholdStore } from '../../src/store/householdStore';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../src/theme/colors';

export default function MoreScreen() {
  const household = useHouseholdStore((s) => s.household);
  const members = useHouseholdStore((s) => s.members);
  const items = useHouseholdStore((s) => s.items);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  const boughtCount = items.filter((i) => i.status === 'bought').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primaryEmerald]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.displayName?.charAt(0) ?? '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user?.displayName ?? 'Family Member'}</Text>
            <Text style={styles.profilePhone}>{user?.phoneNumber ?? ''}</Text>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>Free Plan</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/paywall')} style={styles.upgradeBtn}>
            <Ionicons name="star" size={14} color={Colors.accentAmber} />
            <Text style={styles.upgradeBtnText}>Upgrade</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total Items', value: items.length, icon: '🛒' },
            { label: 'Bought', value: boughtCount, icon: '✅' },
            { label: 'Members', value: members.length, icon: '👥' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statBox}>
              <Text style={styles.statEmoji}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Household Info */}
        <Text style={styles.sectionTitle}>🏡 Household</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Name</Text>
            <Text style={styles.cardValue}>{household.familyName}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Plan</Text>
            <Text style={[styles.cardValue, { color: Colors.accentAmber }]}>Free (3 members max)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Invite Code</Text>
            <TouchableOpacity>
              <Text style={[styles.cardValue, { color: Colors.primaryEmerald }]}>
                {household.householdId.slice(0, 8).toUpperCase()} · Copy
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Members */}
        <Text style={styles.sectionTitle}>👥 Members</Text>
        <View style={styles.card}>
          {members.map((m, idx) => (
            <View key={m.userId}>
              <View style={styles.memberRow}>
                <View style={[styles.memberAvatar, m.isOnline && styles.memberAvatarOnline]}>
                  <Text style={styles.memberInitial}>{m.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <Text style={styles.memberRole}>{m.role} · {m.phoneNumber}</Text>
                </View>
                {m.isOnline && (
                  <View style={styles.onlineDot} />
                )}
              </View>
              {idx < members.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Settings */}
        <Text style={styles.sectionTitle}>⚙️ Settings</Text>
        <View style={styles.card}>
          {[
            { icon: 'star-outline', label: 'Upgrade to Premium', action: () => router.push('/paywall'), color: Colors.accentAmber },
            { icon: 'notifications-outline', label: 'Notifications (Phase 2)', action: () => {}, color: Colors.textDark },
            { icon: 'share-outline', label: 'Share App', action: () => {}, color: Colors.textDark },
            { icon: 'information-circle-outline', label: 'About GharSync v1.0', action: () => {}, color: Colors.textDark },
          ].map((item, idx, arr) => (
            <View key={item.label}>
              <TouchableOpacity style={styles.settingRow} onPress={item.action}>
                <Ionicons name={item.icon as any} size={22} color={item.color} style={{ marginRight: 12 }} />
                <Text style={[styles.settingLabel, { color: item.color }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.grey300} />
              </TouchableOpacity>
              {idx < arr.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={Colors.accentRed} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    padding: 20,
    gap: 14,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#fff' },
  profileName: { fontSize: FontSize.base, fontFamily: 'Inter_700Bold', color: '#fff' },
  profilePhone: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_400Regular', marginTop: 2 },
  profileBadge: { marginTop: 4, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.sm, alignSelf: 'flex-start' },
  profileBadgeText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter_600SemiBold' },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    gap: 4,
  },
  upgradeBtnText: { fontSize: FontSize.xs, color: '#fff', fontFamily: 'Inter_700Bold' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 14,
    alignItems: 'center',
    ...Shadow.sm,
  },
  statEmoji: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: FontSize.xl, fontFamily: 'Inter_900Black', color: Colors.textDark },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontFamily: 'Inter_400Regular', marginTop: 2 },
  sectionTitle: { fontSize: FontSize.sm, fontFamily: 'Inter_700Bold', color: Colors.textMedium, marginTop: 4 },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden', ...Shadow.sm },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13 },
  cardLabel: { fontSize: FontSize.sm, color: Colors.textMuted, fontFamily: 'Inter_400Regular' },
  cardValue: { fontSize: FontSize.sm, fontFamily: 'Inter_600SemiBold', color: Colors.textDark },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  memberAvatarOnline: { borderWidth: 2, borderColor: Colors.primaryEmerald },
  memberInitial: { fontSize: FontSize.base, fontFamily: 'Inter_700Bold', color: Colors.primaryDark },
  memberName: { fontSize: FontSize.sm, fontFamily: 'Inter_700Bold', color: Colors.textDark },
  memberRole: { fontSize: FontSize.xs, color: Colors.textMuted, fontFamily: 'Inter_400Regular', marginTop: 1 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primaryEmerald },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  settingLabel: { flex: 1, fontSize: FontSize.base, fontFamily: 'Inter_600SemiBold' },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.accentRed,
    gap: 8,
    marginTop: 8,
  },
  signOutText: { color: Colors.accentRed, fontSize: FontSize.base, fontFamily: 'Inter_700Bold' },
});
