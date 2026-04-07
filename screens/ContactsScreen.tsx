import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import {
  addEmergencyContact,
  deleteEmergencyContact,
  getEmergencyContacts,
  type EmergencyContact,
} from '../storage/emergencyContacts';
import { theme } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Contacts'>;
};

export default function ContactsScreen({ navigation }: Props) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const list = await getEmergencyContacts();
    setContacts(list);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const onAdd = async () => {
    if (!name.trim() || !phone.trim()) {
      setError('Enter both name and phone.');
      return;
    }
    setError(null);
    await addEmergencyContact(name, phone);
    setName('');
    setPhone('');
    await load();
  };

  const onDelete = (item: EmergencyContact) => {
    Alert.alert('Remove contact?', `${item.name} will no longer receive SOS SMS.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await deleteEmergencyContact(item.id);
          await load();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
        </View>
        <Text style={styles.title}>Contacts</Text>
        <Text style={styles.subtitle}>
          These people receive the same SOS SMS as your optional .env numbers. All are included in one
          message.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Contact name"
            placeholderTextColor={theme.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone (include country code if needed)"
            placeholderTextColor={theme.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.85} onPress={() => void onAdd()}>
            <Text style={styles.addBtnText}>Add contact</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.listHeading}>Saved ({contacts.length})</Text>
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.empty}>No contacts yet. Add at least one for SOS SMS.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowPhone}>{item.phone}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => onDelete(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.deleteBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  flex: { flex: 1, paddingHorizontal: 24 },
  headerRow: { marginTop: 4, marginBottom: 8 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 8 },
  backText: { fontSize: 16, fontWeight: '600', color: theme.primary },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.text,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: { fontSize: 14, lineHeight: 20, color: theme.textMuted, marginBottom: 20 },
  form: { marginBottom: 20 },
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
    marginBottom: 14,
  },
  error: { color: theme.danger, fontSize: 14, marginBottom: 10 },
  addBtn: {
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  listHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: { paddingBottom: 24 },
  empty: { fontSize: 15, color: theme.textMuted, lineHeight: 22 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  rowText: { flex: 1, marginRight: 12 },
  rowName: { fontSize: 16, fontWeight: '600', color: theme.text },
  rowPhone: { fontSize: 14, color: theme.textMuted, marginTop: 4 },
  deleteBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  deleteBtnText: { fontSize: 15, fontWeight: '600', color: theme.danger },
});
