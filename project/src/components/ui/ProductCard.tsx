import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

import { useCartStore } from '../Store/cartStore';
import { useAuthStore } from '../Store/authStore';
import { useWishlistStore } from '../Store/usewhishliststore';
import { submitRating } from '../../services/productproduitservice';
import { product } from '../../types';



interface ProductCardProps {
  product: product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated, user, accessToken } = useAuthStore();
  const [isHovered, setIsHovered] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const isWishlisted = isInWishlist(product.id);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || !user) {
      toast.error('Veuillez vous connecter pour gérer la liste de souhaits.');
      return;
    }
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        toast.success('Retiré de la liste de souhaits.');
      } else {
        await addToWishlist(product);
        toast.success('Ajouté à la liste de souhaits.');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la liste de souhaits.');
      console.error('Wishlist error:', error);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || !user) {
      toast.error('Veuillez vous connecter pour ajouter au panier.');
      return;
    }
    try {
      await addToCart(product.id, 1);
      toast.success('Produit ajouté au panier !');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier.');
      console.error('Cart error:', error);
    }
  };

  const handleRatingSubmit = async (rating: number) => {
    if (!isAuthenticated || !user) {
      toast.error('Veuillez vous connecter pour noter le produit.');
      return;
    }
    if (user.role?.toLowerCase() !== 'client') {
      toast.error('Seuls les clients peuvent noter les produits.');
      return;
    }
    if (!accessToken) {
      toast.error('Token d\'authentification manquant');
      return;
    }

    try {
      const response = await submitRating(product.id, rating);
      setUserRating(rating);
      toast.success('Note enregistrée avec succès !');

      if (response.data.rating) {
        product.average_rating = response.data.rating;
      }
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement de la note.');
      console.error('Rating submission error:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMarchandName = () => {
    if (typeof product.marchand === 'object' && product.marchand !== null) {
      return product.marchand.name;
    }
    return `Marchand ID: ${product.marchand}`;
  };

  return (
    <div
      className="card relative group bg-white shadow-md rounded-lg overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Labels */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.est_nouveau && (
          <span className="bg-secondary text-white text-xs px-2 py-1 rounded-sm font-medium">
            Nouveau
          </span>
        )}
      
        {product.est_mis_en_avant && (
          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-sm font-medium">
            Mis en avant
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div
        className={`absolute right-2 top-2 z-10 flex flex-col gap-2 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          className="bg-white p-2 rounded-full shadow-md hover:bg-primary hover:text-white transition-colors"
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? 'Retirer de la liste de souhaits' : 'Ajouter à la liste de souhaits'}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-primary text-primary' : ''}`} />
        </button>
        <Link
          to={`/products/${product.id}`}
          className="bg-white p-2 rounded-full shadow-md hover:bg-primary hover:text-white transition-colors"
          aria-label="Vue rapide"
        >
          <Eye className="h-4 w-4" />
        </Link>
      </div>

      {/* Image with Link */}
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image || 'https://via.placeholder.com/300'}
            alt={product.nom || 'Produit'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{getMarchandName()}</p>
        <h3 className="font-medium text-sm mb-2 line-clamp-2 min-h-[2.5rem]">{product.nom}</h3>

        {/* Rating Display and Input */}
        <div className="flex items-center mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <button
                key={i}
                onClick={() => handleRatingSubmit(i + 1)}
                className={`h-3.5 w-3.5 ${
                  i < (userRating || Math.floor(product.average_rating || 0))
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                } focus:outline-none`}
                aria-label={`Noter ${i + 1} étoile${i + 1 > 1 ? 's' : ''}`}
                disabled={!isAuthenticated || user?.role?.toLowerCase() !== 'client'}
              >
                <svg className="h-full w-full" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">({(product.average_rating || 0).toFixed(1)})</span>
        </div>

        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-bold text-primary">{product.prix} €</p>
            <p className="text-xs text-gray-600 mt-1">
              Stock: {product.en_stock ? `${product.stock} disponible(s)` : 'Épuisé'}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
            aria-label="Ajouter au panier"
            disabled={!product.en_stock}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>

        {/* Additional Fields */}
        <div className="text-xs text-gray-600 space-y-1">
          {product.couleur && <p>Couleur: {product.couleur}</p>}
          {product.taille && <p>Taille: {product.taille}</p>}
          <p>Créé le: {formatDate(product.created_at)}</p>
          <p>Mis à jour le: {formatDate(product.updated_at)}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;