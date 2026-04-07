import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@women_safety_emergency_contacts';

export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
};

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is EmergencyContact =>
        typeof row === 'object' &&
        row !== null &&
        'id' in row &&
        'name' in row &&
        'phone' in row &&
        typeof (row as EmergencyContact).id === 'string' &&
        typeof (row as EmergencyContact).name === 'string' &&
        typeof (row as EmergencyContact).phone === 'string'
    );
  } catch {
    return [];
  }
}

async function saveEmergencyContacts(contacts: EmergencyContact[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

export async function addEmergencyContact(name: string, phone: string): Promise<EmergencyContact> {
  const contacts = await getEmergencyContacts();
  const contact: EmergencyContact = {
    id: `ec_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    name: name.trim(),
    phone: phone.trim(),
  };
  contacts.push(contact);
  await saveEmergencyContacts(contacts);
  return contact;
}

export async function deleteEmergencyContact(id: string): Promise<void> {
  const contacts = await getEmergencyContacts();
  await saveEmergencyContacts(contacts.filter((c) => c.id !== id));
}

/** Phone strings for SMS (all saved contacts). */
export async function getEmergencyContactPhones(): Promise<string[]> {
  const contacts = await getEmergencyContacts();
  return contacts.map((c) => c.phone.trim()).filter(Boolean);
}
