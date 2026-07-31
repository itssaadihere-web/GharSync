import { create } from 'zustand';
import type { AuthUser } from '../models/types';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  signInDemo: (name: string, phone: string) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  signInDemo: (name: string, phone: string) => {
    set({
      user: {
        uid: `demo_${Date.now()}`,
        displayName: name || 'Family Member',
        phoneNumber: phone || '+92 300 0000000',
      },
    });
  },

  signOut: () => set({ user: null }),
}));
