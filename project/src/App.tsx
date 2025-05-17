// src/App.tsx
import { Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import OrdersPage from './pages/OrdersPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MerchantDashboard from './dashboard/pages/MerchantDashboard';
import AdminDashboard from './admin/AdminDashboard';
import ShopCreatorPage from './admin/pages/CategoryPage';
import ErrorBoundary from './ErrorBoundary';
import CategoryBoutiquesPage from './pages/CategoryBoutiquesPage';
import BoutiqueCategoriesPage from './pages/BoutiqueCategoriesPage';
import BoutiqueProductsPage from './pages/BoutiqueProductsPage';
import ProductCard from './pages/ProductDetailPage';


import Layout from './components/layout/layoutt';
import PaiementClient from './pages/PaiementClient';
import CustomerMessages from './dashboard/CustomerMessages';

function App() {


  return (
   
      <CartProvider>
        <WishlistProvider>
          <Toaster position="top-center" />
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Public Routes */}
                <Route path="/" index element={<HomePage />} />
                <Route path="/HomePage" element={<Navigate to="/" replace />} /> {/* Redirect /HomePage to / */}
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/:productId" element={<ProductCard />} />
                <Route path="/gigs" element={<ShopCreatorPage />} />
                <Route path="/category-boutiques/:categoryId" element={<CategoryBoutiquesPage />} />
                <Route path="/boutique/:boutiqueId/categories" element={<BoutiqueCategoriesPage />} />
                <Route path="/boutique/:boutiqueId/category/:categoryId" element={<BoutiqueProductsPage />} />
                <Route path="/PaiementClient" element={<PaiementClient />} />
                {/* Protected Routes */}
                <Route
                  path="cart"
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="checkout"
                  element={
                 
                      <CheckoutPage />
                  
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="wishlist"
                  element={
                    <ProtectedRoute>
                      <WishlistPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="MerchantDashboard/:boutiqueId" element={<MerchantDashboard />} />
                <Route path="AdminDashboard" element={<AdminDashboard />} />
                <Route path="ShopCreatorPage" element={<ShopCreatorPage />} />
                <Route path="/boutique/:boutiqueId/messages" element={<CustomerMessages />} />

                
              </Route>
              {/* Routes without Layout */}
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Routes>
          </ErrorBoundary>
        </WishlistProvider>
      </CartProvider>
   
  );
}

export default App;