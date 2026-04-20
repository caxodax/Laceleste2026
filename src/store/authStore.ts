import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initAuth: () => (() => void);
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            displayName: profile?.display_name || 'Usuario',
            role: profile?.role || 'customer',
            createdAt: new Date(data.user.created_at),
          },
          loading: false,
        });
      }
    } catch (error: any) {
      let errorMessage = 'Error al iniciar sesión';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Credenciales inválidas';
      }
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, loading: false });
    } catch (error) {
      set({ error: 'Error al cerrar sesión', loading: false });
      throw error;
    }
  },

  initAuth: () => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            displayName: profile?.display_name || 'Usuario',
            role: profile?.role || 'customer',
            createdAt: new Date(session.user.created_at),
          },
          initialized: true,
          loading: false,
        });
      } else {
        set({ user: null, initialized: true, loading: false });
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          set({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              displayName: profile?.display_name || 'Usuario',
              role: profile?.role || 'customer',
              createdAt: new Date(session.user.created_at),
            },
            initialized: true,
            loading: false,
          });
        } else {
          set({ user: null, initialized: true, loading: false });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  },

  clearError: () => set({ error: null }),
}));
