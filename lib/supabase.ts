import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// AsyncStorage doesn't work during SSR (no `window`).
// Lazy-import it only on native, use localStorage on web client-side.
const storage = Platform.OS === 'web'
  ? (typeof window !== 'undefined'
    ? {
        getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
        setItem: (key: string, value: string) => { window.localStorage.setItem(key, value); return Promise.resolve(); },
        removeItem: (key: string) => { window.localStorage.removeItem(key); return Promise.resolve(); },
      }
    : {
        // SSR no-op — session won't persist on the server, which is fine
        getItem: () => Promise.resolve(null),
        setItem: () => Promise.resolve(),
        removeItem: () => Promise.resolve(),
      })
  : require('@react-native-async-storage/async-storage').default;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Ensure the Supabase auth session is active before running data queries.
 * Supabase PostgREST queries can hang indefinitely when the auth token
 * isn't properly set (e.g. orphaned lock from React Strict Mode).
 * Call this before any write flow to fail fast instead of hanging.
 */
export async function ensureAuthSession(): Promise<string> {
  // Try getSession first (fast, uses cached token)
  const { data: { session }, error } = await supabase.auth.getSession();
  if (!error && session?.user?.id) return session.user.id;

  // Fallback: refresh the session (handles stale cache on web)
  const { data: { session: refreshed }, error: refreshErr } = await supabase.auth.refreshSession();
  if (!refreshErr && refreshed?.user?.id) return refreshed.user.id;

  throw new Error('No active session — please sign in again');
}

/**
 * Wrap a Supabase query promise with a timeout to prevent infinite hangs.
 * Returns the query result or throws after the timeout.
 */
export function withTimeout<T>(promise: PromiseLike<T>, ms = 15000, label = 'Query'): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]) as Promise<T>;
}
