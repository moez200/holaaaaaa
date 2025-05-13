import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBoutiqueProductsByCategory } from '../services/boutiqueService';
import {  Boutique, Product } from '../types';
import ProductCard from '../components/ui/ProductCard';
import { ArrowLeft } from 'lucide-react';
import api from '../axiosInstance';

const BoutiqueProductsPage = () => {
  const { boutiqueId, categoryId } = useParams<{ boutiqueId: string; categoryId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        if (boutiqueId && categoryId) {
          const productData = await getBoutiqueProductsByCategory(boutiqueId, categoryId);
          setProducts(productData);

          // Fetch boutique details to get the boutique name
          const boutiqueResponse = await api.get(`boutique/boutiques/${boutiqueId}/`);
          setBoutique(boutiqueResponse.data);

          // Fetch category details to get the category name
          const categoryResponse = await api.get(`boutique/category_produits/${categoryId}/`);
          setCategoryName(categoryResponse.data.nom);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [boutiqueId, categoryId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          to={`/boutique/${boutiqueId}/categories`} 
          className="flex items-center text-primary hover:text-primary-dark"
        >
          <ArrowLeft className="mr-2" size={20} />
          Retour aux catégories
        </Link>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold mb-8">
        Produits dans {categoryName} - {boutique?.nom}
      </h1>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">Aucun produit trouvé dans cette catégorie.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={{
                id: product.id,
                name: product.nom,
                images: [product.image || 'https://via.placeholder.com/300'],
                price: parseFloat(product.prix),
                discountedPrice: null,
                rating: 4.5,
                isNew: new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                vendor: {
                  id: parseInt(product.boutique),
                  name: boutique?.nom || 'Unknown'
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BoutiqueProductsPage;