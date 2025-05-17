import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/ui/HeroSlider';
import ProductCard from '../components/ui/ProductCard';
import CategoryCard from '../components/ui/CategoryCard';
import VendorCard from '../components/ui/VendorCard';
import SaveNowPayLaterBanner from '../components/ui/SaveNowPayLaterBanner';
import { getCategoryBoutiques } from '../services/boutiqueService';
import { getNewProducts, getPopularProducts } from '../services/productproduitservice';
import { getTopMarchand } from '../services/userService';

import { CategoryBoutique, product, Vendor } from '../types';
import { commentService } from '../services/commentaireService';

interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  avatar: string;
  content: string;
  created_at: string;
}

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryBoutique[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<product[]>([]);
  const [newProducts, setNewProducts] = useState<product[]>([]);
 
  const [topMarchand, setTopMarchand] = useState<Vendor | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch produits populaires
        const popularProducts = await getPopularProducts();
        const normalizedPopularProducts = popularProducts.map((p: product) => ({
          id: p.id,
          nom: p.nom,
          prix: p.prix,
          stock: p.stock || 0,
          image: p.image || undefined,
          couleur: p.couleur || '',
          taille: p.taille || '',
          average_rating: p.average_rating || 0,
          en_stock: p.en_stock ?? true,
          est_nouveau: p.est_nouveau ?? false,
          est_mis_en_avant: p.est_mis_en_avant ?? false,
          created_at: p.created_at || '',
          updated_at: p.updated_at || '',
        }));
        setFeaturedProducts(normalizedPopularProducts);

        // Fetch nouveaux produits
        const newProductsData = await getNewProducts();
        const normalizedNewProducts = newProductsData.map((p: product) => ({
          id: p.id,
          nom: p.nom,
          prix: p.prix,
          stock: p.stock || 0,
          image: p.image || undefined,
          couleur: p.couleur || '',
          taille: p.taille || '',
          average_rating: p.average_rating || 0,
          en_stock: p.en_stock ?? true,
          est_nouveau: p.est_nouveau ?? false,
          est_mis_en_avant: p.est_mis_en_avant ?? false,
          created_at: p.created_at || '',
          updated_at: p.updated_at || '',
        }));
        setNewProducts(normalizedNewProducts);

        // Fetch catégories
        const categoryData = await getCategoryBoutiques();
        setCategories(categoryData);

        // Fetch top marchand
        const topMarchandData = await getTopMarchand();
        console.log('kkk', topMarchandData);
        setTopMarchand(topMarchandData);

        // Fetch commentaires
        const commentData = await commentService.getAllComments();
        setComments(commentData);
        console.log("comments =", comments);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Catégories</h2>
            <Link to="/categories" className="text-primary hover:text-primary-dark font-medium">
              Voir toutes les catégories
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Produits Populaires</h2>
            <Link to="/products?filter=featured" className="text-primary hover:text-primary-dark font-medium">
              Voir tous les produits populaires
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product: product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Save Now Pay Later Banner */}
      <SaveNowPayLaterBanner />

      {/* New Arrivals Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Nouveautés</h2>
            <Link to="/products?filter=new" className="text-primary hover:text-primary-dark font-medium">
              Voir toutes les nouveautés
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newProducts.slice(0, 4).map((product: product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {topMarchand && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Nos Vendeurs</h2>
              <Link to="/vendors" className="text-primary hover:text-primary-dark font-medium">
                Voir tous les vendeurs
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <VendorCard key={topMarchand.id} vendor={topMarchand} />
            </div>
          </div>
        </section>
      )}

      {/* Comments Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Ce que disent nos clients</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {comments.length === 0 ? (
              <p className="text-center text-gray-500 col-span-3">Aucun commentaire pour le moment.</p>
            ) : (
              comments.slice(0, 3).map((comment) => (
                <div key={comment.id} className="bg-white p-6 rounded-lg shadow-md">
                  <p className="text-gray-600 mb-4">{comment.content}</p>
                  <div className="flex items-center">
                    <img
                      src={comment.avatar}
                      alt={comment.user_name}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <p className="font-medium">{comment.user_name}</p>
                      <p className="text-sm text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;