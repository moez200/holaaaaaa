import { useEffect } from 'react';
import ProductCard from '../components/ui/ProductCard';
import { useWishlistStore } from '../components/Store/usewhishliststore'; // Ensure path is correct
// Import auth store
import { Product } from '../types';
import { useAuthStore } from '../components/Store/authStore';

function WishlistPage() {
  const { items, isLoading, error, fetchWishlist } = useWishlistStore();
  const { isAuthenticated, user } = useAuthStore();

  // Fetch wishlist when component mounts
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchWishlist(user.id);
    }
  }, [isAuthenticated, user?.id, fetchWishlist]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

      {!isAuthenticated ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Please log in to view your wishlist.</p>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Your wishlist is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;