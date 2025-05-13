import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';


import { addToCart } from '../services/cartService';
import api from '../axiosInstance';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../components/Store/authStore';
import { Product } from '../types';

const API_URL = 'http://localhost:8000/boutique/';

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);
        if (!productId) {
          throw new Error('ID du Product manquant');
        }
        const response = await api.get(`${API_URL}produits/${productId}/`);
        console.log('Fetched product:', response.data); // Debug API response
        // Ensure prix is a number
        const productData = {
          ...response.data,
          prix: typeof response.data.prix === 'string' ? parseFloat(response.data.prix) : response.data.prix,
        };
        setProduct(productData);
      } catch (err: any) {
        console.error('Error fetching product details:', err);
        setError(err.message || 'Erreur lors de la récupération des détails du Product');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductDetails();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Veuillez vous connecter pour ajouter au panier');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    if (!product || !product.id) {
      toast.error('Product non valide');
      return;
    }
    try {
      await addToCart(user.id, product.id, 1);
      toast.success('Product ajouté au panier avec succès !');
      navigate('/cart');
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      toast.error(err.message || 'Erreur lors de l\'ajout au panier');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Product non trouvé</p>
      </div>
    );
  }

  // Validate prix before rendering
  const displayPrice = typeof product.prix === 'number' && !isNaN(product.prix)
    ? product.prix.toFixed(2)
    : 'N/A';

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-8">{product.nom}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <img
          src={product.image ? `${API_URL}${product.image}` : 'https://via.placeholder.com/300'}
          alt={product.nom}
          className="w-full h-auto object-cover rounded-lg"
        />
        <div>
          <p className="text-gray-600 mb-4">{product.description || 'Aucune description disponible'}</p>
          <p className="text-2xl font-semibold mb-4">{displayPrice} €</p>
          <p className="text-gray-600 mb-4">Stock : {product.stock ?? 'N/A'}</p>
          <p className="text-gray-600 mb-4">Couleur : {product.couleur || 'N/A'}</p>
          <p className="text-gray-600 mb-4">Taille : {product.taille || 'N/A'}</p>
          <p className="text-gray-600 mb-4">Boutique : {product.boutique_details.nom || 'Inconnu'}</p>
          <button
            onClick={handleAddToCart}
            className="bg-primary text-white py-2 px-6 rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
            disabled={product.stock === 0 || isLoading}
          >
            {product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;