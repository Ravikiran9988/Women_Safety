import { PermissionStatus } from 'expo-modules-core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import * as TaskManager from 'expo-task-manager';
import type { Session } from '../context/AuthContext';
import { SOS_API_URL } from '../config/sosConfig';
import { getAllSmsRecipientNumbers } from './smsRecipients';

export type SosLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export type SosPipelineResult = {
  location: SosLocation | null;
  locationError?: string;
  post: { ok: boolean; skipped?: boolean; error?: string; status?: number };
  sms: {
    ok: boolean;
    skipped?: boolean;
    error?: string;
    detail?: string;
    recipientCount?: number;
  };
};

export type TrackingPayload = {
  type: 'tracking';
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    accuracyMeters: number | null;
  };
  profile: { name: string; phone: string } | null;
  mode: 'guest' | 'user';
};

// Background tracking task name
const BACKGROUND_TRACKING_TASK = 'background-tracking';

// Define background location tracking task
TaskManager.defineTask(BACKGROUND_TRACKING_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data && data.locations && data.locations.length > 0) {
    const location = data.locations[0];
    const sosLocation: SosLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy ?? null,
    };

    // Get current session from storage
    try {
      const sessionData = await AsyncStorage.getItem('tracking-session');
      const session: Session | null = sessionData ? JSON.parse(sessionData) : null;
      const sosId = await AsyncStorage.getItem('current-sos-id');

      if (!sosId) {
        console.error('No SOS ID found for tracking');
        return;
      }

      const payload: TrackingPayload = {
        type: 'tracking',
        timestamp: new Date().toISOString(),
        location: {
          latitude: sosLocation.latitude,
          longitude: sosLocation.longitude,
          accuracyMeters: sosLocation.accuracy,
        },
        profile: session?.mode === 'user' ? { name: session.name, phone: session.phone } : null,
        mode: session?.mode === 'user' ? 'user' : 'guest',
      };

      if (SOS_API_URL) {
        const response = await fetch(SOS_API_URL, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...payload, sosId }),
        });
        const responseBody = await response.text();
        if (!response.ok) {
          console.error('Background tracking failed:', response.status, responseBody);
        } else {
          console.log('Background tracking update sent:', response.status, responseBody);
        }
      }
    } catch (e) {
      console.error('Background tracking update failed:', e);
    }
  }
});

function buildPayload(session: Session | null, loc: SosLocation | null): Record<string, unknown> {
  const base = {
    type: 'sos',
    timestamp: new Date().toISOString(),
    location: loc
      ? {
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracyMeters: loc.accuracy,
        }
      : null,
  };
  if (session?.mode === 'user') {
    return {
      ...base,
      profile: { name: session.name, phone: session.phone },
    };
  }
  return { ...base, profile: null, mode: 'guest' };
}

function buildSmsBody(session: Session | null, loc: SosLocation | null): string {
  const who =
    session?.mode === 'user'
      ? `Name: ${session.name}\nPhone: ${session.phone}\n`
      : 'Guest session (no profile)\n';
  if (loc) {
    const maps = `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
    return (
      `SOS — SafeCircle emergency alert\n${who}` +
      `Location: ${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}\n` +
      (loc.accuracy != null ? `Accuracy ~${Math.round(loc.accuracy)}m\n` : '') +
      `Map: ${maps}`
    );
  }
  return `SOS — SafeCircle emergency alert\n${who}Location could not be obtained.`;
}

export async function executeSosPipeline(session: Session | null): Promise<SosPipelineResult> {
  const result: SosPipelineResult = {
    location: null,
    post: { ok: false },
    sms: { ok: false },
  };

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== PermissionStatus.GRANTED) {
      result.locationError = 'Location permission was not granted.';
    } else {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      result.location = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy ?? null,
      };
    }
  } catch (e) {
    result.locationError = e instanceof Error ? e.message : 'Could not read GPS.';
  }

  const payload = buildPayload(session, result.location);

  if (!SOS_API_URL) {
    result.post = { ok: false, skipped: true, error: 'EXPO_PUBLIC_SOS_API_URL is not set.' };
  } else {
    try {
      console.log('🚨 Sending SOS payload:', payload);
      const res = await fetch(SOS_API_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const responseData = await res.json();
      console.log('🚨 SOS API response:', res.status, responseData);
      if (!res.ok) {
        result.post = {
          ok: false,
          status: res.status,
          error: responseData.error || `HTTP ${res.status}`,
        };
      } else {
        result.post = { ok: true, status: res.status };

        // Store the SOS ID for tracking updates
        if (responseData.sosId) {
          await AsyncStorage.setItem('current-sos-id', responseData.sosId);
          console.log('📝 SOS ID stored:', responseData.sosId);
        }

        // Start background tracking after successful SOS
        startBackgroundTracking(session);
      }
    } catch (e) {
      console.error('🚨 SOS API request failed:', e);
      result.post = {
        ok: false,
        error: e instanceof Error ? e.message : 'Network request failed',
      };
    }
  }

  const recipients = await getAllSmsRecipientNumbers();
  if (recipients.length === 0) {
    result.sms = {
      ok: false,
      skipped: true,
      error: 'Add emergency contacts or set EXPO_PUBLIC_SMS_RECIPIENTS in .env.',
    };
  } else {
    try {
      const available = await SMS.isAvailableAsync();
      if (!available) {
        result.sms = { ok: false, error: 'SMS is not available on this device.' };
      } else {
        const message = buildSmsBody(session, result.location);
        const smsOutcome = await SMS.sendSMSAsync(recipients, message);
        const r = smsOutcome.result;
        const ok = r === 'sent' || r === 'unknown';
        result.sms = {
          ok,
          detail: r,
          recipientCount: recipients.length,
          error: ok ? undefined : r === 'cancelled' ? 'User cancelled SMS.' : undefined,
        };
      }
    } catch (e) {
      result.sms = {
        ok: false,
        error: e instanceof Error ? e.message : 'Failed to open SMS.',
      };
    }
  }

  return result;
}

export function summarizeSosResult(r: SosPipelineResult): string {
  const lines: string[] = [];
  if (r.location) {
    lines.push(
      `Location: ${r.location.latitude.toFixed(5)}, ${r.location.longitude.toFixed(5)}`
    );
  } else {
    lines.push(`Location: unavailable${r.locationError ? ` (${r.locationError})` : ''}`);
  }
  if (r.post.skipped) {
    lines.push(`Server: skipped — ${r.post.error ?? ''}`);
  } else if (r.post.ok) {
    lines.push(`Server: alert sent (${r.post.status ?? 'OK'})`);
  } else {
    lines.push(`Server: failed — ${r.post.error ?? 'unknown error'}`);
  }
  if (r.sms.skipped) {
    lines.push(`SMS: skipped — ${r.sms.error ?? ''}`);
  } else if (r.sms.ok) {
    const n = r.sms.recipientCount;
    const suffix = n != null ? ` (${n} recipient${n === 1 ? '' : 's'})` : '';
    lines.push(
      `SMS: ${r.sms.detail === 'unknown' ? 'composer opened / sent' : 'sent'}${suffix}`
    );
  } else {
    lines.push(`SMS: failed — ${r.sms.error ?? 'unknown'}`);
  }
  return lines.join('\n');
}

/** Start background location tracking (continues when app is closed) */
export async function startBackgroundTracking(session: Session | null): Promise<void> {
  try {
    // Store session for background task to access
    await AsyncStorage.setItem('tracking-session', JSON.stringify(session));

    // Check if background location permission is granted
    const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
    if (backgroundStatus !== PermissionStatus.GRANTED) {
      console.warn('Background location permission not granted - tracking disabled');
      return;
    }

    // Check if task is already running
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TRACKING_TASK);
    if (isRegistered) {
      console.log('Background tracking already running');
      return;
    }

    // Start background location updates
    await Location.startLocationUpdatesAsync(BACKGROUND_TRACKING_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000, // 5 seconds
      distanceInterval: 5, // 5 meters
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'SafeCircle SOS Tracking',
        notificationBody: 'Location tracking is active for emergency response',
        notificationColor: '#E63946',
      },
    });

    console.log('Background tracking started');
  } catch (error) {
    console.error('Failed to start background tracking:', error);
  }
}

/** Stop background location tracking */
export async function stopBackgroundTracking(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TRACKING_TASK);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_TRACKING_TASK);
      console.log('Background tracking stopped');
    }

    // Clear stored session
    await AsyncStorage.removeItem('tracking-session');
    await AsyncStorage.removeItem('current-sos-id');
  } catch (error) {
    console.error('Failed to stop background tracking:', error);
  }
}