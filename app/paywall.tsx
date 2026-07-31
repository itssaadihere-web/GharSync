import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, Radius, Shadow } from '../src/theme/colors';

const FEATURES = [
  { free: 'Up to 3 members', premium: 'Unlimited members ♾️', highlight: true },
  { free: '✓ Real-time sync', premium: '✓ Real-time sync' },
  { free: 'Rule-Based AI', premium: 'Gemini LLM 🤖' },
  { free: '🔒 Phase 2', premium: '✓ Voice Notes 🎙️' },
  { free: '🔒 Phase 2', premium: '✓ WhatsApp Bot 💬' },
  { free: 'Basic', premium: 'Instant FCM 🔔' },
];

export default function PaywallScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero */}
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primaryEmerald]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroEmoji}>👑</Text>
          <Text style={styles.heroTitle}>Upgrade Your Family Household</Text>
          <Text style={styles.heroSub}>
            Simplify grocery management for everyone at home.
          </Text>
        </LinearGradient>

        {/* Feature Comparison */}
        <View style={styles.card}>
          <View style={styles.tableHeader}>
            <Text style={[styles.col, styles.colFeature]}>Feature</Text>
            <Text style={[styles.col, styles.colFree]}>Free</Text>
            <Text style={[styles.col, styles.colPremium]}>Premium</Text>
          </View>
          {FEATURES.map((f, i) => (
            <View key={i} style={[styles.tableRow, f.highlight && styles.tableRowHL]}>
              <Text style={[styles.col, styles.colFeature, { color: Colors.textDark }]}>
                {['Members', 'List Sync', 'AI Parser', 'Voice Input', 'WhatsApp', 'Notifications'][i]}
              </Text>
              <Text style={[styles.col, styles.colFree]}>{f.free}</Text>
              <Text style={[styles.col, styles.colPremium, { color: Colors.primaryEmerald, fontFamily: 'Inter_700Bold' }]}>
                {f.premium}
              </Text>
            </View>
          ))}
        </View>

        {/* Pricing Card */}
        <View style={styles.pricingCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pricingTitle}>Family Yearly Pass</Text>
            <Text style={styles.pricingPrice}>PKR 1,499 / year</Text>
            <Text style={styles.pricingNote}>~$4.99/yr · Save 50%</Text>
          </View>
          <View style={styles.saveBadge}>
            <Text style={styles.saveBadgeText}>BEST VALUE</Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.cta}>
          <LinearGradient
            colors={[Colors.primaryDark, Colors.primaryEmerald]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.ctaText}>Start 7-Day Free Trial</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          No payment during trial. Cancel anytime. Available on Google Play.
        </Text>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Maybe later</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  hero: {
    borderRadius: Radius.xl,
    padding: 28,
    alignItems: 'center',
    gap: 10,
  },
  heroEmoji: { fontSize: 52 },
  heroTitle: { fontSize: FontSize.xl, fontFamily: 'Inter_700Bold', color: '#fff', textAlign: 'center' },
  heroSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontFamily: 'Inter_400Regular' },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden', ...Shadow.sm },
  tableHeader: { flexDirection: 'row', backgroundColor: Colors.grey50, paddingHorizontal: 14, paddingVertical: 10 },
  tableRow: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  tableRowHL: { backgroundColor: `${Colors.primaryEmerald}08` },
  col: { fontSize: FontSize.xs, fontFamily: 'Inter_400Regular', color: Colors.textMuted },
  colFeature: { flex: 2 },
  colFree: { flex: 1.5, textAlign: 'center' },
  colPremium: { flex: 1.5, textAlign: 'center' },
  pricingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentAmberLight,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.accentAmber,
    padding: 16,
  },
  pricingTitle: { fontSize: FontSize.base, fontFamily: 'Inter_700Bold', color: Colors.textDark },
  pricingPrice: { fontSize: FontSize.lg, fontFamily: 'Inter_900Black', color: Colors.accentAmber, marginTop: 2 },
  pricingNote: { fontSize: FontSize.xs, color: Colors.textMuted, fontFamily: 'Inter_400Regular', marginTop: 2 },
  saveBadge: { backgroundColor: Colors.accentAmber, borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  saveBadgeText: { fontSize: FontSize.xs, fontFamily: 'Inter_700Bold', color: '#fff' },
  cta: { borderRadius: Radius.lg, overflow: 'hidden' },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  ctaText: { fontSize: FontSize.base, fontFamily: 'Inter_700Bold', color: '#fff' },
  disclaimer: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textMuted, fontFamily: 'Inter_400Regular' },
  backBtn: { alignItems: 'center', paddingVertical: 12 },
  backBtnText: { color: Colors.textMuted, fontSize: FontSize.sm, fontFamily: 'Inter_400Regular' },
});
