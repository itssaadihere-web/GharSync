import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/store/authStore';
import { Colors, Radius, FontSize, Spacing, Shadow } from '../src/theme/colors';

export default function LoginScreen() {
  const signInDemo = useAuthStore((s) => s.signInDemo);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [isCreating, setIsCreating] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your name to continue.');
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    signInDemo(name.trim(), phone.trim() || '+92 300 0000000');
    router.replace('/(app)');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header Gradient Card */}
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primaryEmerald]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.logoEmoji}>🏡</Text>
          <Text style={styles.appName}>GharSync</Text>
          <Text style={styles.tagline}>One Shared List for the Entire Family</Text>
        </LinearGradient>

        <View style={styles.card}>
          {/* Name */}
          <Text style={styles.label}>Your Name</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={Colors.primaryEmerald} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Ammi, Abbu, Sara"
              placeholderTextColor={Colors.grey400}
            />
          </View>

          {/* Phone */}
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="phone-portrait-outline" size={20} color={Colors.primaryEmerald} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+92 300 1234567"
              placeholderTextColor={Colors.grey400}
              keyboardType="phone-pad"
            />
          </View>

          {/* Toggle */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggle, isCreating && styles.toggleActive]}
              onPress={() => setIsCreating(true)}
            >
              <Text style={[styles.toggleText, isCreating && styles.toggleTextActive]}>
                Create Household
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggle, !isCreating && styles.toggleActive]}
              onPress={() => setIsCreating(false)}
            >
              <Text style={[styles.toggleText, !isCreating && styles.toggleTextActive]}>
                Join via Code
              </Text>
            </TouchableOpacity>
          </View>

          {/* Family Name / Invite Code */}
          {isCreating ? (
            <>
              <Text style={styles.label}>Family / Household Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="home-outline" size={20} color={Colors.primaryEmerald} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={familyName}
                  onChangeText={setFamilyName}
                  placeholder="e.g. Khan Family Household"
                  placeholderTextColor={Colors.grey400}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.label}>Household Invite Code</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="qr-code-outline" size={20} color={Colors.primaryEmerald} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Paste invite code here"
                  placeholderTextColor={Colors.grey400}
                />
              </View>
            </>
          )}

          {/* Demo Login Button */}
          <TouchableOpacity
            style={[styles.demoBtn, isLoading && { opacity: 0.7 }]}
            onPress={handleDemoLogin}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[Colors.primaryDark, Colors.primaryEmerald]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.demoBtnGradient}
            >
              <Ionicons name="flash" size={20} color="#fff" />
              <Text style={styles.demoBtnText}>
                {isLoading ? 'Signing in...' : '⚡ Quick Demo — Enter App'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Demo mode — data stays on your device only. Firebase sync coming in Phase 2.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  header: {
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoEmoji: { fontSize: 56, marginBottom: 12 },
  appName: { fontSize: 34, fontFamily: 'Inter_900Black', color: '#fff', letterSpacing: 1 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 6 },
  card: {
    margin: 20,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 24,
    ...Shadow.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontFamily: 'Inter_700Bold',
    color: Colors.textMedium,
    marginBottom: 6,
    marginTop: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grey50,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: FontSize.base,
    color: Colors.textDark,
    fontFamily: 'Inter_400Regular',
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.grey100,
    borderRadius: Radius.md,
    padding: 4,
    marginVertical: 16,
    gap: 4,
  },
  toggle: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  toggleActive: { backgroundColor: Colors.surface, ...Shadow.sm },
  toggleText: { fontSize: FontSize.sm, fontFamily: 'Inter_600SemiBold', color: Colors.grey500 },
  toggleTextActive: { color: Colors.primaryEmerald },
  demoBtn: { marginTop: 24, borderRadius: Radius.md, overflow: 'hidden' },
  demoBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  demoBtnText: { fontSize: FontSize.base, fontFamily: 'Inter_700Bold', color: '#fff' },
  disclaimer: {
    textAlign: 'center',
    marginTop: 14,
    fontSize: FontSize.xs,
    color: Colors.grey400,
    fontFamily: 'Inter_400Regular',
  },
});
