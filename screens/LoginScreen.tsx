import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const { setUser } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      setError('Please enter your name and phone number.');
      return;
    }
    setError(null);
    await setUser(name, phone);
    navigation.reset({ index: 0, routes: [{ name: 'SOS' }] });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>
            Optional — helps identify you if you share alerts with trusted contacts later.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={theme.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor={theme.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={onSubmit}>
            <Text style={styles.primaryBtnText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.linkText}>Back</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  flex: { flex: 1, paddingHorizontal: 24 },
  header: { marginTop: 8, marginBottom: 28 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: { fontSize: 15, lineHeight: 22, color: theme.textMuted },
  form: { flex: 1 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textMuted,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.text,
    backgroundColor: theme.card,
    marginBottom: 18,
  },
  error: { color: theme.danger, fontSize: 14, marginTop: -8, marginBottom: 8 },
  footer: { paddingBottom: 8, gap: 16 },
  primaryBtn: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  linkBtn: { alignSelf: 'center', paddingVertical: 8 },
  linkText: { fontSize: 16, color: theme.primary, fontWeight: '600' },
});
