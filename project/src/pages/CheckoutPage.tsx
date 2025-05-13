import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { placeOrder } from '../services/cartService';
import { ShoppingBag, CreditCard, Truck, User } from 'lucide-react';
import { useCartStore } from '../components/Store/cartStore';
import toast from 'react-hot-toast';
import { useAuthStore } from '../components/Store/authStore';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { panier, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    adresse: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false); // New flag

  console.log('CheckoutPage State:', { user, panier });

  useEffect(() => {
    if (user) {
      setShippingInfo({
        firstName: user.prenom || '',
        lastName: user.nom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        adresse: user.adresse || '',
      });
    }
  }, [user]);

  const calculateTotal = () => {
    if (!panier?.lignes) return 0;
    return panier.lignes.reduce(
      (total, item) => total + parseFloat(item.produit.prix) * item.quantite,
      0
    );
  };

  const total = calculateTotal();
  const tax = total * 0.1;
  const grandTotal = total + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) {
      toast.error('Session expirée. Veuillez vous reconnecter.');
      navigate('/login');
      return;
    }
    if (!panier?.lignes?.length) {
      setError('Votre panier est vide');
      navigate('/cart');
      return;
    }

    const { firstName, lastName, email, telephone, adresse } = shippingInfo;
    if (!firstName || !lastName || !email || !telephone || !adresse) {
      setError("Veuillez remplir tous les champs d'information d'expédition");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderPayload = {
        client_id: user!.id,
        shipping_info: {
          firstName,
          lastName,
          email,
          telephone,
          adresse,
        },
        items: panier.lignes.map((item) => ({
          produit_id: item.produit.id,
          quantite: item.quantite,
          prix: item.produit.prix,
        })),
        total: grandTotal,
      };

      console.log('Order payload:', orderPayload);
      const response = await placeOrder(orderPayload);
      console.log('Order response:', response);

      if (!response.id) {
        throw new Error("La réponse du serveur ne contient pas d'ID de commande");
      }

      const orderId = response.id;
      console.log('Clearing cart...');
         navigate('/PaiementClient', {
        state: {
          client_id: user!.id,
          order_id: orderId,
          order_data: response,
        },
      });
   
      console.log('Cart cleared, navigating to PaiementClient...');
      setOrderPlaced(true); // Set flag to indicate success
      toast.success('Commande passée avec succès !');
   
      console.log('Navigation triggered');
    } catch (err: any) {
      console.error('Place order error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Erreur lors de la passation de la commande';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skip navigation to /cart if order was just placed
  if (!orderPlaced && (!panier || !panier.lignes?.length)) {
    setError('Votre panier est vide');
    navigate('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Passer la commande</h1>
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {user && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations du compte
              </h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Nom: </span>
                  {user.prenom} {user.nom}
                </p>
                <p>
                  <span className="font-medium">Email: </span>
                  {user.email}
                </p>
                <p>
                  <span className="font-medium">Téléphone: </span>
                  {user.telephone || 'Non spécifié'}
                </p>
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Résumé de la commande
            </h2>
            <div className="divide-y">
              {panier?.lignes?.map((item) => (
                <div key={item.id} className="py-4 flex items-center gap-4">
                  <img
                    src={
                      item.produit.image
                        ? `http://localhost:8000${item.produit.image}`
                        : 'https://via.placeholder.com/300'
                    }
                    alt={item.produit.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-medium">{item.produit.name}</h3>
                    <p className="text-gray-600">Quantité: {item.quantite}</p>
                    <p className="text-gray-800 font-medium">
                      €{(parseFloat(item.produit.prix) * item.quantite).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Informations d'expédition
            </h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="Prénom"
                value={shippingInfo.firstName}
                onChange={handleInputChange}
                className="border rounded-lg p-2"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Nom"
                value={shippingInfo.lastName}
                onChange={handleInputChange}
                className="border rounded-lg p-2"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={shippingInfo.email}
                onChange={handleInputChange}
                className="border rounded-lg p-2"
                required
              />
              <input
                type="tel"
                name="telephone"
                placeholder="Téléphone"
                value={shippingInfo.telephone}
                onChange={handleInputChange}
                className="border rounded-lg p-2"
                required
              />
              <input
                type="text"
                name="adresse"
                placeholder="Adresse"
                value={shippingInfo.adresse}
                onChange={handleInputChange}
                className="border rounded-lg p-2 md:col-span-2"
                required
              />
            </form>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Résumé du paiement
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>€{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span>Gratuit</span>
              </div>
              <div className="flex justify-between">
                <span>Taxe</span>
                <span>€{tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 font-semibold">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>€{grandTotal.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className={`w-full bg-blue-600 text-white py-3 rounded-lg mt-4 transition ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Traitement...' : 'Passer la commande'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;