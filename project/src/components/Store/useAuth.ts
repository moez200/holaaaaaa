

import { useAuthStore, AuthState } from './authStore';

export const useAuth = () => {
  const { user, accessToken, isAuthenticated, setTokens, logout, refreshAccessToken } = useAuthStore(
    (state: AuthState) => ({
      user: state.user,
      accessToken: state.accessToken,
      isAuthenticated: state.isAuthenticated,
      setTokens: state.setTokens,
      logout: state.logout,
      refreshAccessToken: state.refreshAccessToken,
    })
  );

  return { user, accessToken, isAuthenticated, setTokens, logout, refreshAccessToken };
};