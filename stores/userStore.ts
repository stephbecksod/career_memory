import { create } from 'zustand';
import { supabase, withTimeout } from '@/lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@/types/database';

interface UserState {
  session: Session | null;
  authUser: SupabaseUser | null;
  profile: User | null;
  loading: boolean;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  fetchProfile: (userId: string) => Promise<void>;
  initialize: () => Promise<void>;
  clear: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  session: null,
  authUser: null,
  profile: null,
  loading: true,
  initialized: false,

  setSession: (session) => {
    set({
      session,
      authUser: session?.user ?? null,
    });
  },

  fetchProfile: async (userId) => {
    // Skip if we already have the profile for this user
    const existing = get().profile;
    if (existing && existing.user_id === userId) return;

    try {
      const { data } = await withTimeout(
        supabase
          .from('users')
          .select('*')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .limit(1),
        8000,
        'Profile fetch',
      );

      const profile = data && data.length > 0 ? data[0] : null;
      if (profile) {
        set({ profile: profile as User });
      }
    } catch (err) {
      // Warn, not error — profile fetch is non-critical if already loaded
      console.warn('[UserStore] fetchProfile failed (non-critical):', err);
    }
  },

  initialize: async () => {
    try {
      const { data: { session } } = await withTimeout(
        supabase.auth.getSession(),
        8000,
        'Auth getSession',
      );
      const store = get();
      store.setSession(session);

      if (session?.user) {
        await store.fetchProfile(session.user.id);
      }
    } catch (err) {
      console.error('[UserStore] initialize failed:', err);
    } finally {
      set({ loading: false, initialized: true });
    }
  },

  clear: () => {
    set({
      session: null,
      authUser: null,
      profile: null,
    });
  },
}));
