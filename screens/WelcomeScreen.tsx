import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: Props) {
  const { setGuest } = useAuth();

  return (
    <View style={styles.gradient}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.badge}>Safe & private</Text>
          <Text style={styles.title}>You are not alone</Text>
          <Text style={styles.subtitle}>
            Quick access to SOS. Sign in is optional — use guest mode anytime.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={async () => {
              await setGuest();
              navigation.reset({ index: 0, routes: [{ name: 'SOS' }] });
            }}
          >
            <Text style={styles.primaryBtnText}>Continue as guest</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryBtnText}>Sign in with phone</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1, backgroundColor: theme.primaryDark },
  safe: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', paddingBottom: 32 },
  header: { marginTop: 24 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.88)',
  },
  actions: { gap: 12 },
  primaryBtn: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: theme.primary },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
