import  { useCallback, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { Product } from '../types';
import { useCartStore } from '../components/Store/cartStore';
import { useAuthStore } from '../components/Store/authStore';
import { debounce } from '@mui/material';

const CartPage = () => {
  const { panier, removeFromCart, updateQuantity, isLoading, error, fetchCart } = useCartStore();
  const { user  } = useAuthStore();
const debouncedFetchCart = useCallback(
    debounce((userId) => {
      console.log('Fetching cart for user:', userId);
      fetchCart(userId);
    }, 500),
    [fetchCart]
  );

  useEffect(() => {
    if (user?.id) {
      debouncedFetchCart(user.id);
    }
  }, [user, debouncedFetchCart]);
  const calculateTotal = () => {
    if (!panier?.lignes) return 0;
    return panier.lignes.reduce((total, item) => total + Number(item.produit.prix) * item.quantite, 0);
  };

  const mapToProduct = (produit: Produit): Product => ({
    id: produit.id,
    nom: produit.nom,
    image: produit.image || 'https://via.placeholder.com/300',
    prix: Number(produit.prix),
    quantite: 0,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Chargement du panier...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => fetchCart(user?.id || 0)}
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!panier?.lignes || panier.lignes.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Votre panier est vide</h2>
        <p className="text-gray-500">Ajoutez des articles à votre panier pour commencer !</p>
      </div>
    );
  }

  console.log('Rendering cart with panier:', panier);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 فرآیند
      mb-8">Panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {panier.lignes.map((item) => {
            const product = mapToProduct(item.produit);
            console.log('Rendering cart item:', item);
            return (
              <div key={item.id} className="flex items-center gap-6 p-6 bg-white rounded-lg shadow-sm mb-4">
                <img
                  src={item.produit.image ? `http://localhost:8000${item.produit.image}` : 'https://via.placeholder.com/300'}
                  alt={product.nom}
                  className="w-24 h-24 object-cover rounded-md"
                />

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{product.nom}</h3>
                  <p className="text-sm text-gray-500">{item.produit.description || 'Aucune description'}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantite - 1))}
                        className="p-2 hover:bg-gray-100"
                        disabled={isLoading}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2">{item.quantite}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantite + 1)}
                        className="p-2 hover:bg-gray-100"
                        disabled={isLoading}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    €{(Number(product.prix) * item.quantite).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">€{Number(product.prix).toFixed(2)} chacun</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé de la commande</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-semibold">€{calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Livraison</span>
                <span className="text-gray-600">Calculé à la caisse</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-semibold">€{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => window.location.href = '/checkout'}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                Passer à la caisse
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;