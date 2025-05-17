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

      setTokens: (data: { user: User; access_token: string; refresh_token: string }) => {
        set({
          user: data.user,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          isAuthenticated: true,
        });
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
      },

      logout: () => {
        get().clearPersistedData();
      },

      setBoutiqueId: (id: number) => {
        set({ boutiqueId: id });
      },

      initializeAuth: async () => {
        // D'abord, réinitialiser l'état à déconnecté
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          boutiqueId: null,
          loading: true,
          initialized: false,
        });

        // Ensuite, vérifier si des tokens existent
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!accessToken || !refreshToken) {
          set({ loading: false, initialized: true });
          return;
        }

        try {
          // Validation stricte avec le serveur
          const response = await axios.get('http://localhost:8000/users/me/', {
            headers: { Authorization: `Bearer ${accessToken}` },
            validateStatus: (status) => status === 200
          });

          const user = response.data;

          if (!user?.id) {
            throw new Error('Invalid user data');
          }

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            loading: false,
            initialized: true,
          });
        } catch (error) {
          console.error('Authentication check failed:', error);
          // Nettoyer complètement en cas d'échec
          get().clearPersistedData();
          set({ loading: false, initialized: true });
        }
      },

      clearPersistedData: () => {
        // Nettoyage plus complet
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('auth-storage');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          boutiqueId: null,
          initialized: true,
          loading: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      // Utilisation de sessionStorage pour une persistance limitée
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        boutiqueId: state.boutiqueId,
        isAuthenticated: state.isAuthenticated,
        initialized: state.initialized,
      }),
    }
  )
);