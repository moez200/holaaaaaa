// src/components/Layout.tsx
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';
import { useAuthStore } from '../Store/authStore';


const Layout = () => {
  const { user, isAuthenticated, loading } = useAuthStore();
  const location = useLocation();


  // Pages où Navbar/Footer sont toujours cachés
  const noLayoutPages = ['/login', '/register', '/admin', '/merchant'];
  const shouldHideLayout = noLayoutPages.some((path) =>
    location.pathname.startsWith(path)
  );

  // Afficher Navbar/Footer si :
  // 1. Ce n'est pas une page exclue (noLayoutPages)
  // 2. Soit l'utilisateur n'est pas connecté (visiteur), soit il a le rôle "client"
  const showLayout = !shouldHideLayout && (!isAuthenticated || user?.role?.toLowerCase() === 'client');

  // Débogage
  console.log('Layout State:', {
    isAuthenticated,
    user,
    userRole: user?.role,
    location: location.pathname,
    shouldHideLayout,
    showLayout,
    loading,
  });

  if (loading) {
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