/**
 * Set in `.env` (Expo loads EXPO_PUBLIC_* at build time):
 * - EXPO_PUBLIC_SOS_API_URL — full URL, e.g. http://192.168.1.10:3000/api/sos
 *   (Android emulator: http://10.0.2.2:3000/api/sos — iOS simulator: http://localhost:3000/api/sos)
 * - EXPO_PUBLIC_SMS_RECIPIENTS — comma-separated E.164 numbers, e.g. +15551234567,+15559876543
 */
export const SOS_API_URL = (process.env.EXPO_PUBLIC_SOS_API_URL ?? '').trim();

export function getSmsRecipients(): string[] {
  const raw = process.env.EXPO_PUBLIC_SMS_RECIPIENTS ?? '';
  return raw
    .split(/[,;\s]+/)
    .map((s: string) => s.trim())
    .filter(Boolean);
}
