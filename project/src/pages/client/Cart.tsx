import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size: string;
  color: string;
  shop: string;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "T-shirt Premium",
      price: 29.99,
      quantity: 2,
      image: "https://images.pexels.com/photos/4066293/pexels-photo-4066293.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      size: "M",
      color: "Blanc",
      shop: "Élégance Boutique"
    },
    {
      id: 2,
      name: "Jean Slim",
      price: 59.99,
      quantity: 1,
      image: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      size: "32",
      color: "Bleu",
      shop: "Tendance Fashion"
    }
  ]);

  const updateQuantity = (id: number, change: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Votre Panier</h1>
          <p className="mt-2 text-gray-600">
            {cartItems.length} article{cartItems.length > 1 ? 's' : ''} dans votre panier
          </p>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="rounded-xl bg-white p-6 shadow-md"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <Link
                          to={`/product/${item.id}`}
                          className="text-lg font-medium text-gray-900 hover:text-primary"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 text-sm text-gray-500">{item.shop}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                          <span>Taille: {item.size}</span>
                          <span>Couleur: {item.color}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">
                          {(item.price * item.quantity).toFixed(2)} €
                        </p>
                        <div className="mt-2 flex items-center justify-end space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="rounded-lg border border-gray-200 p-1 text-gray-600 transition-colors hover:border-primary hover:text-primary"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="rounded-lg border border-gray-200 p-1 text-gray-600 transition-colors hover:border-primary hover:text-primary"
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-4 rounded-lg border border-red-200 p-1 text-red-500 transition-colors hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-24">
              <div className="rounded-xl bg-white p-6 shadow-md">
                <h2 className="text-xl font-bold text-gray-900">Récapitulatif</h2>
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Livraison</span>
                    <span>{shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)} €`}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">{total.toFixed(2)} €</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">TVA incluse</p>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="mt-6 block rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3 text-center font-medium text-white shadow-lg transition-all hover:shadow-xl"
                >
                  <span className="flex items-center justify-center">
                    Passer la commande
                    <ArrowRight size={20} className="ml-2" />
                  </span>
                </Link>

                <div className="mt-6 rounded-lg bg-primary/5 p-4">
                  <div className="flex items-center text-primary">
                    <ShoppingBag size={20} className="mr-2" />
                    <span className="font-medium">Save Now Pay Later</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Payez en 4x sans frais à partir de {(total / 4).toFixed(2)} € par mois
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-white p-8 text-center shadow-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <ShoppingBag size={32} className="text-gray-400" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">Votre panier est vide</h2>
            <p className="mb-6 text-gray-600">
              Découvrez nos produits et commencez votre shopping !
            </p>
            <Link
              to="/category/all"
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl"
            >
              <ShoppingBag size={20} className="mr-2" />
              Continuer mes achats
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;