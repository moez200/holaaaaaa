import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Search, Store, ArrowRight } from 'lucide-react';
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

const ShopCategory = () => {
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<CategoryBoutique[]>([]);
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(id || 'all');
  const [searchTerm, setSearchTerm] = useState('');
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
          { id: 2, nom: 'Tendance Fashion', description: 'Les dernières tendances à prix abordables', image: 'https://images.pexels.com/photos/6068960/pexels-photo-6068960.jpeg?auto=compress&cs=tinysrgb&w=600', category_boutique: 1 },
          { id: 3, nom: 'TechWorld', description: 'Tout pour les amateurs de technologie', image: 'https://images.pexels.com/photos/792199/pexels-photo-792199.jpeg?auto=compress&cs=tinysrgb&w=600', category_boutique: 2 },
          { id: 4, nom: 'GadgetZone', description: 'Les meilleurs gadgets électroniques', image: 'https://images.pexels.com/photos/2080544/pexels-photo-2080544.jpeg?auto=compress&cs=tinysrgb&w=600', category_boutique: 2 },
          { id: 5, nom: 'Intérieur Design', description: 'Décoration d\'intérieur moderne', image: 'https://images.pexels.com/photos/1668860/pexels-photo-1668860.jpeg?auto=compress&cs=tinysrgb&w=600', category_boutique: 3 },
          { id: 6, nom: 'Home Sweet Home', description: 'Tout pour rendre votre maison confortable', image: 'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=600', category_boutique: 3 },
          { id: 7, nom: 'Beauty Secret', description: 'Produits de beauté premium', image: 'https://images.pexels.com/photos/3767409/pexels-photo-3767409.jpeg?auto=compress&cs=tinysrgb&w=600', category_boutique: 4 },
          { id: 8, nom: 'Glow Up', description: 'Cosmétiques et soins pour une peau parfaite', image: 'https://images.pexels.com/photos/2625667/pexels-photo-2625667.jpeg?auto=compress&cs=tinysrgb&w=600', category_boutique: 4 },
        ];

        setCategories(mockCategories);
        setBoutiques(mockStores);

        // Uncomment to use real API
        // const [categoriesData, storesData] = await Promise.all([
        //   getCategoryBoutiques(),
        //   getBoutiques()
        // ]);
        // setCategories(categoriesData);
        // setBoutiques(storesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter boutiques based on category and search term
  const filteredBoutiques = boutiques.filter(boutique => {
    const matchesCategory = selectedCategory === 'all' || boutique.category_boutique === parseInt(selectedCategory as string);
    const matchesSearch = boutique.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         boutique.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pb-12 pt-24">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Explorez nos boutiques</h1>
          <p className="text-lg text-gray-600">
            Découvrez une variété de boutiques et trouvez ce que vous cherchez
          </p>
        </div>
        
        {/* Search & Filter */}
        <div className="mb-10 rounded-2xl bg-white p-6 shadow-lg">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search size={20} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Rechercher une boutique..." 
                className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative md:w-60">
              <select 
                className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-4 pr-8 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.nom}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <Filter size={20} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Categories Pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-primary to-secondary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(String(category.id))}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === String(category.id)
                  ? 'bg-gradient-to-r from-primary to-secondary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.nom}
            </button>
          ))}
        </div>
        
        {/* Boutiques Grid */}
        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : filteredBoutiques.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBoutiques.map((boutique, index) => (
              <motion.div
                key={boutique.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="overflow-hidden rounded-2xl bg-white shadow-lg transition-shadow hover:shadow-xl"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={boutique.image} 
                    alt={boutique.nom} 
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" 
                  />
                  <div className="absolute top-4 right-4">
                    <div className="rounded-full bg-white/80 p-2 backdrop-blur-sm">
                      <Store size={16} className="text-primary" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-bold text-gray-900">{boutique.nom}</h3>
                  <p className="mb-4 text-gray-600 line-clamp-2">{boutique.description}</p>
                  <div className="flex items-center justify-between">
                    <Link 
                      to={`/shop/${boutique.id}`} 
                      className="inline-flex items-center font-medium text-primary transition-colors hover:text-primary-dark"
                    >
                      Visiter la boutique
                      <ArrowRight size={16} className="ml-1" />
                    </Link>
                    <span className="text-sm text-gray-500">
                      {categories.find(c => c.id === boutique.category_boutique)?.nom}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-gray-50 py-16 text-center">
            <Store size={48} className="mx-auto text-gray-400" />
            <h3 className="mt-4 text-xl font-semibold text-gray-700">Aucune boutique trouvée</h3>
            <p className="mt-2 text-gray-500">Essayez de modifier vos filtres de recherche</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopCategory;