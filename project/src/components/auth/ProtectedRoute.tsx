// src/components/auth/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../Store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuthStore();

  console.log('ProtectedRoute State:', {
    isAuthenticated,
    user,
    loading,
    currentPath: window.location.pathname,
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute redirecting to /login from:', window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;