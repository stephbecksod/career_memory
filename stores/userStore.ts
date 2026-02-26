import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
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
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (data) {
      set({ profile: data as User });
    }
  },

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const store = get();
      store.setSession(session);

      if (session?.user) {
        await store.fetchProfile(session.user.id);
      }
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
