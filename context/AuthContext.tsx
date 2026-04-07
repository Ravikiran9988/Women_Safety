import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = '@women_safety_session';

export type Session =
  | { mode: 'guest' }
  | { mode: 'user'; name: string; phone: string };

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  setGuest: () => Promise<void>;
  setUser: (name: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (cancelled) return;
        if (raw) {
          const parsed = JSON.parse(raw) as Session;
          setSession(parsed);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: Session | null) => {
    setSession(next);
    if (next === null) {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } else {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const setGuest = useCallback(async () => {
    await persist({ mode: 'guest' });
  }, [persist]);

  const setUser = useCallback(
    async (name: string, phone: string) => {
      await persist({ mode: 'user', name: name.trim(), phone: phone.trim() });
    },
    [persist]
  );

  const signOut = useCallback(async () => {
    await persist(null);
  }, [persist]);

  const value = useMemo(
    () => ({ session, loading, setGuest, setUser, signOut }),
    [session, loading, setGuest, setUser, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
