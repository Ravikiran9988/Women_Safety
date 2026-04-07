import { getSmsRecipients } from '../config/sosConfig';
import { getEmergencyContactPhones } from '../storage/emergencyContacts';

function normalizeKey(phone: string): string {
  return phone.trim().replace(/\s+/g, '');
}

/** Stored emergency contacts plus optional .env numbers, deduped. */
export async function getAllSmsRecipientNumbers(): Promise<string[]> {
  const [fromContacts, fromEnv] = await Promise.all([
    getEmergencyContactPhones(),
    Promise.resolve(getSmsRecipients()),
  ]);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of [...fromContacts, ...fromEnv]) {
    const key = normalizeKey(p);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(p.trim());
  }
  return out;
}
