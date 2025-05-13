// src/components/Store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../../types';
import axios from 'axios';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  boutiqueId: number | null;
  loading: boolean;
  initialized: boolean;
  setTokens: (data: { user: User; access_token: string; refresh_token: string }) => void;
  logout: () => void;
  setBoutiqueId: (id: number) => void;
  initializeAuth: () => Promise<void>;
  clearPersistedData: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      boutiqueId: null,
      loading: false,
      initialized: false,

      setTokens: ({ user, access_token, refresh_token }) => {
        set({
          user,
          accessToken: access_token,
          refreshToken: refresh_token,
          isAuthenticated: true,
          initialized: true,
        });
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          boutiqueId: null,
          initialized: true,
        });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      },

      setBoutiqueId: (id) => set({ boutiqueId: id }),

      initializeAuth: async () => {
        if (get().initialized || get().loading) return;

        set({ loading: true });

        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!accessToken || !refreshToken) {
          get().clearPersistedData();
          set({ loading: false, initialized: true });
          return;
        }

        try {
          // Validate access token by making a request to a protected endpoint
          const response = await axios.get('http://localhost:8000/users/me/', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const user = response.data;
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            boutiqueId: null,
            loading: false,
            initialized: true,
          });
        } catch (error) {
          console.error('Token validation failed:', error);
          try {
            // Attempt to refresh token
            const response = await axios.post('http://localhost:8000/token/refresh/', {
              refresh: refreshToken,
            });
            const { access_token, refresh_token } = response.data;
            const userResponse = await axios.get('http://localhost:8000/users/me/', {
              headers: { Authorization: `Bearer ${access_token}` },
            });
            set({
              user: userResponse.data,
              accessToken: access_token,
              refreshToken: refresh_token || refreshToken,
              isAuthenticated: true,
              boutiqueId: null,
              loading: false,
              initialized: true,
            });
        
          } catch (refreshError) {
            console.error('Refresh token failed:', refreshError);
            get().clearPersistedData();
            set({ loading: false, initialized: true });
          }
        }
      },

      clearPersistedData: () => {
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          boutiqueId: null,
        });
      },
    }),
    {
     name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken, // Add accessToken
        refreshToken: state.refreshToken, // Add refreshToken
        boutiqueId: state.boutiqueId,
        isAuthenticated: state.isAuthenticated,
        initialized: state.initialized,
      }),
    }
  )
);