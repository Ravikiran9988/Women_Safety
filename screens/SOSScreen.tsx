import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { executeSosPipeline, summarizeSosResult, stopBackgroundTracking } from '../services/sosPipeline';
import { theme } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SOS'>;
};

const HOLD_MS = 2000;

export default function SOSScreen({ navigation }: Props) {
  const { session, signOut } = useAuth();
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);
  const progress = useRef(new Animated.Value(0)).current;
  const animLoop = useRef<Animated.CompositeAnimation | null>(null);

  const clearHold = useCallback(() => {
    animLoop.current?.stop();
    progress.setValue(0);
  }, [progress]);

  const triggerSOS = useCallback(async () => {
    clearHold();
    if (sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    try {
      const result = await executeSosPipeline(session);
      Alert.alert('SOS result', summarizeSosResult(result), [
        { text: 'Call emergency', onPress: () => Linking.openURL('tel:112') },
        { text: 'OK', style: 'cancel' },
      ]);
    } catch (e) {
      Alert.alert('SOS error', e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }, [clearHold, session]);

  const onPressIn = useCallback(() => {
    if (sending) return;
    progress.setValue(0);
    animLoop.current = Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_MS,
      useNativeDriver: true,
    });
    animLoop.current.start(({ finished }) => {
      if (finished) void triggerSOS();
    });
  }, [progress, triggerSOS, sending]);

  const onPressOut = useCallback(() => {
    if (!sending) clearHold();
  }, [clearHold, sending]);

  const onSignOut = useCallback(() => {
    Alert.alert('Leave session?', 'You can return as guest or sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        },
      },
    ]);
  }, [navigation, signOut]);

  const onStopTracking = useCallback(async () => {
    await stopBackgroundTracking();
    Alert.alert('Tracking stopped', 'Live location tracking has been stopped.');
  }, []);

  const ringScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const statusLabel =
    session?.mode === 'user'
      ? `${session.name} · ${session.phone}`
      : 'Guest mode';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.appName}>SafeCircle</Text>
          <Text style={styles.status}>{statusLabel}</Text>
        </View>
        <View style={styles.topBtns}>
          <Pressable
            onPress={() => navigation.navigate('Contacts')}
            style={styles.outlineBtn}
            hitSlop={8}
            disabled={sending}
          >
            <Text style={styles.outlineBtnText}>Contacts</Text>
          </Pressable>
          <Pressable
            onPress={onSignOut}
            style={styles.outlineBtn}
            hitSlop={8}
            disabled={sending}
          >
            <Text style={styles.outlineBtnText}>Exit</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.center}>
        <Text style={styles.instruction}>
          Press and hold the button for 2 seconds. We will read GPS, notify your server, and open SMS
          to your emergency contacts.
        </Text>
        <Animated.View style={[styles.ringOuter, { transform: [{ scale: ringScale }] }]}>
          <Pressable
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={sending}
            style={({ pressed }) => [styles.sosOuter, pressed && styles.sosOuterPressed]}
          >
            <View style={styles.sosInner}>
              <Text style={styles.sosText}>SOS</Text>
              <Text style={styles.sosHint}>{sending ? 'Working…' : 'Hold to activate'}</Text>
            </View>
          </Pressable>
        </Animated.View>
        <Pressable
          onPress={onStopTracking}
          style={({ pressed }) => [styles.safeBtn, pressed && styles.safeBtnPressed]}
          hitSlop={8}
        >
          <Text style={styles.safeBtnText}>I am Safe</Text>
        </Pressable>
      </View>

      <Text style={styles.footerNote}>
        Add people under Contacts (stored on device). SOS SMS goes to every contact plus optional
        EXPO_PUBLIC_SMS_RECIPIENTS. Set EXPO_PUBLIC_SOS_API_URL for your server; run npm run
        sos-server to test locally.
      </Text>

      {sending ? (
        <View style={styles.sendingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.sendingText}>Getting location, contacting server, SMS…</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const SOS_SIZE = 220;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  topBarLeft: { flex: 1, minWidth: 0 },
  topBtns: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  appName: { fontSize: 20, fontWeight: '700', color: theme.text },
  status: { fontSize: 13, color: theme.textMuted, marginTop: 4, maxWidth: 240 },
  outlineBtn: {
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: theme.card,
  },
  outlineBtnText: { fontSize: 14, fontWeight: '600', color: theme.textMuted },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  instruction: {
    fontSize: 15,
    color: theme.textMuted,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  ringOuter: {
    width: SOS_SIZE + 28,
    height: SOS_SIZE + 28,
    borderRadius: (SOS_SIZE + 28) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(230, 57, 70, 0.12)',
  },
  sosOuter: {
    width: SOS_SIZE,
    height: SOS_SIZE,
    borderRadius: SOS_SIZE / 2,
    backgroundColor: theme.danger,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.dangerDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  sosOuterPressed: { opacity: 0.95 },
  sosInner: { alignItems: 'center' },
  sosText: {
    fontSize: 44,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
  },
  sosHint: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  safeBtn: {
    marginTop: 32,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#34C759',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  safeBtnPressed: { opacity: 0.85 },
  safeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footerNote: {
    fontSize: 12,
    lineHeight: 18,
    color: theme.textMuted,
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  sendingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 45, 66, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  sendingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});

console.log("🚀 Sending SOS...");
console.log("API URL:", process.env.EXPO_PUBLIC_SOS_API_URL);