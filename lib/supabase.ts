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
