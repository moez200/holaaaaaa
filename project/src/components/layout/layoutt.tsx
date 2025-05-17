// src/components/Layout.tsx
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';
import { useAuthStore } from '../Store/authStore';
import { useEffect } from 'react';

const Layout = () => {
  const { user, isAuthenticated, loading, initialized, initializeAuth, clearPersistedData } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!initialized) {
      initializeAuth();
    }
  }, [initialized, initializeAuth]);

  useEffect(() => {
    if (initialized && isAuthenticated && !user) {
      clearPersistedData();
    }
  }, [initialized, isAuthenticated, user, clearPersistedData]);

  // Pages où Navbar/Footer doivent être cachés
  const noLayoutPages = ['/login', '/register', '/admin', '/merchant'];
  const shouldHideLayout = noLayoutPages.some(path => 
    location.pathname.startsWith(path)
  );

  // Rôles qui ne doivent pas voir le layout
  const restrictedRoles = ['admin', 'marchand'];
  const hasRestrictedRole = user?.role && restrictedRoles.includes(user.role.toLowerCase());

  // Afficher Navbar/Footer si:
  // 1. Ce n'est pas une page exclue (noLayoutPages)
  // 2. L'utilisateur n'est pas authentifié (visiteur) OU n'a pas de rôle restreint
  const showLayout = !shouldHideLayout && (!isAuthenticated || !hasRestrictedRole);

  if (loading || !initialized) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div>
        {showLayout && <Navbar />}
        <main className="flex-grow p-4">
          <Outlet />
        </main>
      </div>
      {showLayout && <Footer />}
    </div>
  );
};

export default Layout;