// src/contexts/AuthContext.tsx
import { createContext,  useEffect, ReactNode, useContext } from 'react';
import { useAuthStore } from '../components/Store/authStore';
import { User } from '../types';


interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (data: { user: User; accessToken: string; refreshToken: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, accessToken, refreshToken, isAuthenticated, setTokens, logout, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth(); // Vérifier l'état d'authentification au chargement
  }, [initializeAuth]);

  const login = (data: { user: User; accessToken: string; refreshToken: string }) => {
    console.log('Logging in user:', data.user);
    setTokens({
      user: data.user,
      access_token: data.accessToken,
      refresh_token: data.refreshToken,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};