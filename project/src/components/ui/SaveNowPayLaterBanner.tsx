import { Link } from 'react-router-dom';
import { CreditCard, Calendar, Check } from 'lucide-react';

const SaveNowPayLaterBanner = () => {
  return (
    <div className="bg-gradient-to-r from-secondary/90 to-primary/90 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Save Now, Pay Later</h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Achetez vos produits préférés aujourd'hui et payez en plusieurs fois sans frais
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition-colors">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Paiement Flexible</h3>
            <p className="text-white/80">Divisez vos paiements en 3 ou 4 fois sans frais supplémentaires</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition-colors">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Planification Simple</h3>
            <p className="text-white/80">Choisissez votre calendrier de paiement selon vos besoins</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition-colors">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Zéro Complication</h3>
            <p className="text-white/80">Approbation rapide et processus simple en quelques clics</p>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link to="/save-now-pay-later" className="btn-primary bg-white text-primary hover:bg-gray-100 hover:text-primary-dark">
            En savoir plus
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SaveNowPayLaterBanner;