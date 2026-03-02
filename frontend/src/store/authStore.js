import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', { email, password });
          set({
            user: res.data.user,
            accessToken: res.data.accessToken,
            isAuthenticated: true,
            isLoading: false
          });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, message: err.response?.data?.message || 'Login failed' };
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/register', data);
          set({
            user: res.data.user,
            accessToken: res.data.accessToken,
            isAuthenticated: true,
            isLoading: false
          });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, message: err.response?.data?.message || 'Registration failed' };
        }
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch (_) {}
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      refreshToken: async () => {
        try {
          const res = await api.post('/auth/refresh');
          set({ accessToken: res.data.accessToken });
          return res.data.accessToken;
        } catch (_) {
          set({ user: null, accessToken: null, isAuthenticated: false });
          return null;
        }
      },

      setAccessToken: (token) => set({ accessToken: token }),
      updateUser: (user) => set({ user })
    }),
    {
      name: 'janseva-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);
