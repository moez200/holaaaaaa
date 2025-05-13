import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Bell, 
  Settings, 
  CreditCard,
  LogOut,
  ChevronRight
} from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const orders = [
    {
      id: '#ORD-123456',
      date: '2024-02-20',
      total: 89.98,
      status: 'En cours de livraison',
      items: 2
    },
    {
      id: '#ORD-123455',
      date: '2024-02-15',
      total: 149.97,
      status: 'Livré',
      items: 3
    }
  ];

  const wishlist = [
    {
      id: 1,
      name: 'T-shirt Premium',
      price: 29.99,
      image: 'https://images.pexels.com/photos/4066293/pexels-photo-4066293.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 2,
      name: 'Jean Slim',
      price: 59.99,
      image: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-white p-6 shadow-md">
              {/* User Info */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary text-2xl font-bold text-white">
                  {user?.prenom?.[0]}{user?.nom?.[0]}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user?.prenom} {user?.nom}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex w-full items-center rounded-lg px-4 py-2 text-left transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <User size={20} className="mr-3" />
                  <span>Profil</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex w-full items-center rounded-lg px-4 py-2 text-left transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ShoppingBag size={20} className="mr-3" />
                  <span>Commandes</span>
                </button>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`flex w-full items-center rounded-lg px-4 py-2 text-left transition-colors ${
                    activeTab === 'wishlist'
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Heart size={20} className="mr-3" />
                  <span>Liste de souhaits</span>
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex w-full items-center rounded-lg px-4 py-2 text-left transition-colors ${
                    activeTab === 'notifications'
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Bell size={20} className="mr-3" />
                  <span>Notifications</span>
                </button>
                <button
                  onClick={() => setActiveTab('payment')}
                  className={`flex w-full items-center rounded-lg px-4 py-2 text-left transition-colors ${
                    activeTab === 'payment'
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <CreditCard size={20} className="mr-3" />
                  <span>Paiement</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex w-full items-center rounded-lg px-4 py-2 text-left transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings size={20} className="mr-3" />
                  <span>Paramètres</span>
                </button>
                <button
                  onClick={logout}
                  className="flex w-full items-center rounded-lg px-4 py-2 text-left text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut size={20} className="mr-3" />
                  <span>Se déconnecter</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-white p-6 shadow-md"
              >
                <h2 className="mb-6 text-2xl font-bold text-gray-900">Informations personnelles</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prénom</label>
                    <input
                      type="text"
                      defaultValue={user?.prenom}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom</label>
                    <input
                      type="text"
                      defaultValue={user?.nom}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <input
                      type="tel"
                      defaultValue={user?.telephone}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-2 font-medium text-white shadow-lg transition-all hover:shadow-xl">
                    Sauvegarder les modifications
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="rounded-xl bg-white p-6 shadow-md">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">Mes commandes</h2>
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:border-primary"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{order.id}</p>
                          <p className="text-sm text-gray-500">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{order.total.toFixed(2)} €</p>
                          <p className="text-sm text-gray-500">{order.items} articles</p>
                        </div>
                        <div>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                            {order.status}
                          </span>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'wishlist' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-white p-6 shadow-md"
              >
                <h2 className="mb-6 text-2xl font-bold text-gray-900">Liste de souhaits</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {wishlist.map((item) => (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-md"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-48 w-full object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="mt-1 text-lg font-bold text-primary">{item.price.toFixed(2)} €</p>
                        <button className="mt-4 w-full rounded-lg bg-gradient-to-r from-primary to-secondary px-4 py-2 font-medium text-white shadow-md transition-shadow hover:shadow-lg">
                          Ajouter au panier
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-white p-6 shadow-md"
              >
                <h2 className="mb-6 text-2xl font-bold text-gray-900">Notifications</h2>
                <div className="space-y-4">
                  <div className="rounded-lg bg-primary/5 p-4">
                    <h3 className="font-medium text-gray-900">Votre commande a été expédiée</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Votre commande #ORD-123456 a été expédiée et sera livrée dans 2-3 jours.
                    </p>
                    <p className="mt-2 text-xs text-gray-400">Il y a 2 heures</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="font-medium text-gray-900">Nouvelle promotion</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Profitez de -20% sur toute la nouvelle collection !
                    </p>
                    <p className="mt-2 text-xs text-gray-400">Il y a 1 jour</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'payment' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="rounded-xl bg-white p-6 shadow-md">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">Méthodes de paiement</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center">
                        <CreditCard size={24} className="mr-3 text-primary" />
                        <div>
                          <p className="font-medium text-gray-900">Carte Visa se terminant par 4242</p>
                          <p className="text-sm text-gray-500">Expire en 12/24</p>
                        </div>
                      </div>
                      <button className="text-sm font-medium text-primary hover:text-primary-dark">
                        Modifier
                      </button>
                    </div>
                    <button className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 text-gray-600 hover:border-primary hover:text-primary">
                      <CreditCard size={20} className="mr-2" />
                      Ajouter une nouvelle carte
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-md">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">Save Now Pay Later</h2>
                  <div className="rounded-lg bg-primary/5 p-4">
                    <p className="text-gray-700">
                      Vous pouvez payer vos achats en 4 fois sans frais à partir de 50€ d'achat.
                    </p>
                    <button className="mt-4 rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-2 font-medium text-white shadow-md transition-shadow hover:shadow-lg">
                      En savoir plus
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="rounded-xl bg-white p-6 shadow-md">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">Paramètres du compte</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center">
                        <input type="checkbox" className="h-5 w-5 rounded text-primary" defaultChecked />
                        <span className="ml-2 text-gray-700">Recevoir des notifications par email</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input type="checkbox" className="h-5 w-5 rounded text-primary" defaultChecked />
                        <span className="ml-2 text-gray-700">Recevoir des notifications push</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input type="checkbox" className="h-5 w-5 rounded text-primary" />
                        <span className="ml-2 text-gray-700">Recevoir la newsletter</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-md">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">Sécurité</h2>
                  <div className="space-y-4">
                    <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-left text-gray-700 transition-colors hover:border-primary hover:text-primary">
                      Changer le mot de passe
                    </button>
                    <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-left text-gray-700 transition-colors hover:border-primary hover:text-primary">
                      Activer l'authentification à deux facteurs
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-md">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">Données personnelles</h2>
                  <div className="space-y-4">
                    <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-left text-gray-700 transition-colors hover:border-primary hover:text-primary">
                      Télécharger mes données
                    </button>
                    <button className="w-full rounded-lg border border-red-300 px-4 py-2 text-left text-red-600 transition-colors hover:bg-red-50">
                      Supprimer mon compte
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;