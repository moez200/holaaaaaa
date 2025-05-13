import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, TrendingUp, CreditCard, Award, ArrowRight, Search } from 'lucide-react';
import { getCategoryBoutiques, getBoutiques } from '../../services/apiService';

interface CategoryBoutique {
  id: number;
  nom: string;
  image: string;
}

interface Boutique {
  id: number;
  nom: string;
  description: string;
  image: string;
  category_boutique: number;
}

const Home = () => {
  const [categories, setCategories] = useState<CategoryBoutique[]>([]);
  const [featuredStores, setFeaturedStores] = useState<Boutique[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data for development
        const mockCategories = [
          { id: 1, nom: 'Mode', image: 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=600' },
          { id: 2, nom: 'Électronique', image: 'https://images.pexels.com/photos/1337753/pexels-photo-1337753.jpeg?auto=compress&cs=tinysrgb&w=600' },
          { id: 3, nom: 'Maison', image: 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=600' },
          { id: 4, nom: 'Beauté', image: 'https://images.pexels.com/photos/2693644/pexels-photo-2693644.jpeg?auto=compress&cs=tinysrgb&w=600' },
        ];
        
        const mockStores = [
          { id: 1, nom: 'Élégance Boutique', description: 'Mode et accessoires de luxe', image: 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=600', category_boutique: 1 },
          { id: 2, nom: 'TechWorld', description: 'Tout pour les amateurs de technologie', image: 'https://images.pexels.com/photos/792199/pexels-photo-792199.jpeg?auto=compress&cs=tinysrgb&w=600', category_boutique: 2 },
          { id: 3, nom: 'Intérieur Design', description: 'Décoration d\'intérieur moderne', image: 'https://images.pexels.com/photos/1668860/pexels-photo-1668860.jpeg?auto=compress&cs=tinysrgb&w=600', category_boutique: 3 },
          { id: 4, nom: 'Beauty Secret', description: 'Produits de beauté premium', image: 'https://images.pexels.com/photos/3767409/pexels-photo-3767409.jpeg?auto=compress&cs=tinysrgb&w=600', category_boutique: 4 },
        ];

        setCategories(mockCategories);
        setFeaturedStores(mockStores);

        // Uncomment to use real API
        // const [categoriesData, storesData] = await Promise.all([
        //   getCategoryBoutiques(),
        //   getBoutiques()
        // ]);
        // setCategories(categoriesData);
        // setFeaturedStores(storesData.slice(0, 4));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="pb-12 pt-16">
      {/* Hero Section */}
      <section className="relative bg-hero-pattern bg-cover bg-center bg-no-repeat py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-secondary/60"></div>
        <div className="container relative mx-auto px-4">
          <motion.div 
            className="mx-auto max-w-2xl text-center text-white"
            variants={heroVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={itemVariants} className="mb-6 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
              Achetez maintenant, <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">payez plus tard</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="mb-8 text-lg text-gray-200">
              Découvrez une nouvelle façon de faire du shopping avec notre plateforme e-commerce innovante.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 md:justify-center">
              <Link to="/category/all" className="rounded-xl bg-primary px-8 py-3 font-medium text-white shadow-lg transition-all hover:bg-primary-dark hover:shadow-xl">
                Explorer les boutiques
              </Link>
              <Link to="/register" className="rounded-xl bg-white/10 px-8 py-3 font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20">
                Devenir marchand
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="container mx-auto -mt-8 px-4">
        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search size={20} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Rechercher des boutiques ou des produits..." 
                className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <select className="rounded-xl border border-gray-300 bg-gray-50 py-3 pl-4 pr-8 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary md:w-52">
              <option value="">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.nom}</option>
              ))}
            </select>
            <button className="rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3 font-medium text-white shadow-md hover:shadow-lg">
              Rechercher
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto mt-16 px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">Catégories populaires</h2>
          <p className="text-gray-600">Explorez nos catégories de boutiques les plus populaires</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group overflow-hidden rounded-2xl shadow-lg"
            >
              <Link to={`/category/${category.id}`} className="block relative h-56 w-full overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.nom} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="mb-1 text-xl font-bold text-white">{category.nom}</h3>
                  <div className="flex items-center text-white">
                    <span>Explorer</span>
                    <ArrowRight size={16} className="ml-2 transition-transform duration-300 group-hover:translate-x-2" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Link to="/category/all" className="inline-flex items-center rounded-xl border-2 border-primary/20 bg-white px-6 py-3 font-medium text-primary transition-all hover:border-primary/30 hover:bg-primary/5">
            <span>Voir toutes les catégories</span>
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Featured Stores Section */}
      <section className="container mx-auto mt-20 px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">Boutiques en vedette</h2>
          <p className="text-gray-600">Découvrez nos boutiques sélectionnées pour vous</p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {featuredStores.map((store, index) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="overflow-hidden rounded-2xl bg-white shadow-lg transition-shadow hover:shadow-xl"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={store.image} 
                  alt={store.nom} 
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" 
                />
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-xl font-bold text-gray-900">{store.nom}</h3>
                <p className="mb-4 text-gray-600 line-clamp-2">{store.description}</p>
                <Link 
                  to={`/shop/${store.id}`} 
                  className="inline-flex items-center font-medium text-primary transition-colors hover:text-primary-dark"
                >
                  Visiter la boutique
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Link to="/category/all" className="btn-primary">
            <span>Explorer toutes les boutiques</span>
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto mt-20 px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">Pourquoi nous choisir</h2>
          <p className="text-gray-600">Des avantages uniques pour une expérience d'achat exceptionnelle</p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShoppingBag size={28} />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">Large sélection</h3>
            <p className="text-gray-600">Des milliers de produits dans des centaines de boutiques.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <CreditCard size={28} />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">Payez plus tard</h3>
            <p className="text-gray-600">Achetez maintenant et échelonnez vos paiements sans frais.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Award size={28} />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">Qualité garantie</h3>
            <p className="text-gray-600">Des produits sélectionnés et vérifiés par notre équipe.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <TrendingUp size={28} />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">Tendances</h3>
            <p className="text-gray-600">Découvrez les produits les plus populaires et tendance.</p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto mt-20 px-4">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-secondary p-8 md:p-12">
          <div className="md:flex md:items-center md:justify-between">
            <div className="mb-6 md:mb-0 md:w-2/3">
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Devenez marchand dès aujourd'hui</h2>
              <p className="text-lg text-white/90">
                Développez votre activité en rejoignant notre plateforme et accédez à des milliers de clients.
              </p>
            </div>
            <div>
              <Link 
                to="/register" 
                className="block rounded-xl bg-white px-8 py-4 text-center font-medium text-primary shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
              >
                Commencer gratuitement
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;