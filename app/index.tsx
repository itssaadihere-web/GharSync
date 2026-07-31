import { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../src/store/authStore';
import { Colors } from '../src/theme/colors';

export default function SplashIndex() {
  const user = useAuthStore((s) => s.user);
  const scale = new Animated.Value(0.7);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60 }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace(user ? '/(app)' : '/login');
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={[Colors.primaryDark, Colors.primaryEmerald]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={[styles.logoBox, { transform: [{ scale }], opacity }]}>
        <Text style={styles.logoEmoji}>🏡</Text>
      </Animated.View>

      <Animated.View style={{ opacity }}>
        <Text style={styles.appName}>GharSync</Text>
        <Text style={styles.tagline}>Family Household Manager</Text>
        <Text style={styles.subtitle}>Share lists. Shop together. Stay in sync.</Text>
      </Animated.View>

      <Animated.View style={[styles.dotsRow, { opacity }]}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[styles.dot, i === 1 && styles.dotActive]}
          />
        ))}
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  logoBox: {
    width: 110,
    height: 110,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  logoEmoji: { fontSize: 58 },
  appName: {
    fontSize: 38,
    fontFamily: 'Inter_900Black',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    marginTop: 6,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 48,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 24,
    borderRadius: 4,
  },
});
