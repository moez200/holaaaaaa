import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Share2, ArrowLeft, Star, Truck, Shield, RefreshCw } from 'lucide-react';

interface Product {
  id: number;
  nom: string;
  description: string;
  prix: number;
  stock: number;
  image: string;
  couleur?: string;
  taille?: string;
  boutique: {
    id: number;
    nom: string;
  };
}

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for development
    const mockProduct = {
      id: 1,
      nom: "T-shirt Premium",
      description: "Un t-shirt confortable et élégant, parfait pour toutes les occasions. Fabriqué avec du coton 100% bio.",
      prix: 29.99,
      stock: 50,
      image: "https://images.pexels.com/photos/4066293/pexels-photo-4066293.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      couleur: "Blanc",
      taille: "M",
      boutique: {
        id: 1,
        nom: "Élégance Boutique"
      }
    };

    setTimeout(() => {
      setProduct(mockProduct);
      setLoading(false);
    }, 1000);

    // Uncomment to use real API
    // const fetchProduct = async () => {
    //   try {
    //     const response = await fetch(`/api/products/${id}`);
    //     const data = await response.json();
    //     setProduct(data);
    //   } catch (error) {
    //     console.error('Error fetching product:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchProduct();
  }, [id]);

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Blanc', 'Noir', 'Gris', 'Bleu', 'Rouge'];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          Produit non trouvé
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link to="/category/all" className="flex items-center text-gray-600 hover:text-primary">
            <ArrowLeft size={20} className="mr-2" />
            Retour aux produits
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-lg"
          >
            <img
              src={product.image}
              alt={product.nom}
              className="h-[500px] w-full rounded-lg object-cover"
            />
            <button className="absolute right-6 top-6 rounded-full bg-white p-2 text-gray-600 shadow-md transition-colors hover:text-primary">
              <Heart size={24} />
            </button>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <Link
                to={`/shop/${product.boutique.id}`}
                className="text-sm font-medium text-primary hover:text-primary-dark"
              >
                {product.boutique.nom}
              </Link>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.nom}</h1>
              <div className="mt-4 flex items-center space-x-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} fill="currentColor" />
                  ))}
                </div>
                <span className="text-sm text-gray-500">(121 avis)</span>
              </div>
            </div>

            <p className="text-lg text-gray-600">{product.description}</p>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-gray-900">{product.prix} €</span>
                <div className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-600">
                  En stock
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Ou payez en 4x sans frais avec Save Now Pay Later
              </p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-900">Taille</h3>
              <div className="grid grid-cols-6 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 text-gray-900 hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-900">Couleur</h3>
              <div className="grid grid-cols-5 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      selectedColor === color
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 text-gray-900 hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-900">Quantité</h3>
              <div className="flex w-32 items-center rounded-lg border border-gray-200">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-10 w-10 items-center justify-center text-gray-600 hover:text-primary"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-10 w-full border-x border-gray-200 text-center"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-10 w-10 items-center justify-center text-gray-600 hover:text-primary"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex space-x-4">
              <button className="flex-1 rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3 text-white shadow-lg transition-all hover:shadow-xl">
                <span className="flex items-center justify-center">
                  <ShoppingCart size={20} className="mr-2" />
                  Ajouter au panier
                </span>
              </button>
              <button className="rounded-xl border border-gray-200 p-3 text-gray-600 transition-colors hover:border-primary hover:text-primary">
                <Share2 size={20} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-6">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Truck size={24} />
                </div>
                <h4 className="text-sm font-medium text-gray-900">Livraison gratuite</h4>
                <p className="mt-1 text-xs text-gray-500">À partir de 50€</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Shield size={24} />
                </div>
                <h4 className="text-sm font-medium text-gray-900">Garantie 2 ans</h4>
                <p className="mt-1 text-xs text-gray-500">Satisfait ou remboursé</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <RefreshCw size={24} />
                </div>
                <h4 className="text-sm font-medium text-gray-900">Retours gratuits</h4>
                <p className="mt-1 text-xs text-gray-500">Sous 30 jours</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;