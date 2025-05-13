import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBoutiquesByCategory } from '../services/boutiqueService';
import { Boutique } from '../types';
import VendorCard from '../components/ui/VendorCard';
import { ArrowLeft } from 'lucide-react';
import HeroSlider from '../components/ui/HeroSlider';

const CategoryBoutiquesPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);

  useEffect(() => {
    const fetchBoutiques = async () => {
      try {
        setIsLoading(true);
        if (categoryId) {
          const data = await getBoutiquesByCategory(parseInt(categoryId));
          setBoutiques(data);
          if (data.length > 0 && data[0].category_boutique) {
            setCategoryName(typeof data[0].category_boutique === 'number' ? 'Catégorie' : data[0].category_boutique.nom);
          } else {
            setCategoryName('Catégorie');
          }
        }
      } catch (err: any) {
        console.error('Error fetching boutiques:', err);
        setError(err.response?.data?.error || 'Failed to load boutiques. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoutiques();
  }, [categoryId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl animate-pulse"></div>
          <div className="relative flex items-center justify-center h-32 w-32 rounded-full bg-white shadow-xl">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-spin duration-1000 opacity-30"></div>
            <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-lg">Chargement...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="relative group max-w-md w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-pink-400 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
          <div className="relative px-8 py-6 bg-white rounded-lg shadow-lg">
            <div className="text-center space-y-4">
              <div className="text-rose-500 text-2xl">⚠️</div>
              <p className="text-rose-600 font-medium">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full hover:shadow-lg transition-all duration-300"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden relative">
      {/* Floating bubbles background */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white/80"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 200 + 50}px`,
              height: `${Math.random() * 200 + 50}px`,
              filter: 'blur(40px)',
              opacity: 0.3,
              animation: `float ${Math.random() * 20 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-12 relative">
        {/* Back button with floating effect */}
        <HeroSlider />
        <div className="mb-12 group">
          <Link 
            to="/" 
            className="inline-flex items-center gap-3 text-blue-600 hover:text-purple-600 transition-colors duration-300"
          >
            <div className="relative">
              <div className="absolute -inset-2 bg-blue-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all duration-300 border border-blue-100">
                <ArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" size={20} />
              </div>
            </div>
            <span className="font-medium">Retour à l'accueil</span>
          </Link>
        </div>

        {/* Title with rainbow effect */}
        <div className="mb-16 relative">
          <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full bg-purple-200/40 blur-3xl -z-10"></div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x">
                {categoryName}
              </span>
              <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-pink-400 rounded-full"></span>
            </span>
          </h1>
          <p className="text-xl text-blue-600/80 max-w-2xl">
            Découvrez les boutiques exceptionnelles de cette catégorie
          </p>
        </div>

        {/* Boutiques grid */}
        {boutiques.length === 0 ? (
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl blur-xl opacity-60 -z-10"></div>
            <div className="relative bg-white/90 backdrop-blur-sm p-12 rounded-2xl shadow-lg border border-blue-100 text-center">
              <h3 className="text-2xl font-bold text-blue-600 mb-4">
                Aucune boutique trouvée
              </h3>
              <p className="text-blue-500/80">
                Nous n'avons pas trouvé de boutiques dans cette catégorie pour le moment.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {boutiques.map((boutique) => (
              <div 
                key={boutique.id}
                className="relative group transform transition-all duration-500 hover:-translate-y-2 hover:z-10"
              >
                {/* Card glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-200 to-purple-200 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                
                {/* Card content */}
                <div className="relative h-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-50 overflow-hidden">
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10 -z-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-200 to-transparent"></div>
                  </div>
                  
                  <VendorCard 
                    vendor={{
                      id: boutique.id,
                      name: boutique.nom,
                      logo: boutique.logo || 'https://via.placeholder.com/150',
                      description: boutique.description || '',
                      rating: 4.5,
                      productsCount: 12
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes animate-gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default CategoryBoutiquesPage;