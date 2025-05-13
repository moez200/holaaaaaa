import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  image: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  colorScheme: 'light' | 'dark';
}

const slides: Slide[] = [
  {
    id: 1,
    image: 'https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Nouveautés parfums',
    description: 'Découvrez notre collection printemps avec 25% de réduction',
    ctaText: 'Découvrir',
    ctaLink: '/products?category=Parfums',
    colorScheme: 'light',
  },
  {
    id: 2,
    image: 'https://images.pexels.com/photos/5069432/pexels-photo-5069432.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Essentiels beauté',
    description: 'Tous les produits indispensables pour votre routine',
    ctaText: 'Voir les produits',
    ctaLink: '/products?category=Maquillage',
    colorScheme: 'dark',
  },
  {
    id: 3,
    image: 'https://images.pexels.com/photos/5240677/pexels-photo-5240677.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Soins visage',
    description: 'Pour une peau éclatante toute l\'année',
    ctaText: 'En savoir plus',
    ctaLink: '/products?category=Soin+Visage',
    colorScheme: 'light',
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(goToNextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[400px] sm:h-[500px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div className="relative h-full">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-center">
              <div className="container mx-auto px-6 md:px-10">
                <div className="max-w-lg">
                  <h1 
                    className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${
                      slide.colorScheme === 'light' ? 'text-white' : 'text-white'
                    }`}
                  >
                    {slide.title}
                  </h1>
                  <p 
                    className={`mb-6 text-lg ${
                      slide.colorScheme === 'light' ? 'text-gray-100' : 'text-gray-200'
                    }`}
                  >
                    {slide.description}
                  </p>
                  <Link
                    to={slide.ctaLink}
                    className="btn-primary inline-block"
                  >
                    {slide.ctaText}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation buttons */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/40 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={goToNextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/40 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;