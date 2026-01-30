import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Role } from '../types/user';

type AuthState = {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,

  setAuth: async (token, user) => {
    if (user.role !== Role.USER) {
      throw new Error('Invalid role for customer app');
    }

    // Persist both token and user
    await Promise.all([
      AsyncStorage.setItem('token', token),
      AsyncStorage.setItem('user', JSON.stringify(user)),
    ]);
    set({ token, user });
  },

  logout: async () => {
    // Remove both token and user
    await Promise.all([
      AsyncStorage.removeItem('token'),
      AsyncStorage.removeItem('user'),
    ]);
    set({ token: null, user: null });
  },

  hydrate: async () => {
    // Load both token and user in parallel
    const [token, userStr] = await Promise.all([
      AsyncStorage.getItem('token'),
      AsyncStorage.getItem('user'),
    ]);
    if (token) set({ token });
    if (userStr) set({ user: JSON.parse(userStr) });
  },
}));