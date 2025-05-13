
import React, { useState, useEffect } from 'react';
import { Loader2, Search } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../components/Store/authStore';

const API_URL = 'http://localhost:8000/users/';

interface PurchaseItem {
  produit_id: string;
  produit_nom: string;
  prix: number;
  quantite: number;
  total: number;
}

interface PurchaseOrder {
  order_id: string;
  created_at: string;
  items: PurchaseItem[];
  total_montant: number;
}

const PurchaseHistory: React.FC = () => {
  const { user, accessToken } = useAuthStore();
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'total'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  // Récupérer l'historique des achats
  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      if (!user || !accessToken) {
        setError('Vous devez être connecté pour voir votre historique d\'achats.');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_URL}client/purchase-history/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setPurchaseHistory(response.data.orders || []);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Erreur lors de la récupération de l\'historique des achats.';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Fetch purchase history error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchaseHistory();
  }, [user, accessToken]);

  // Filtrer et trier les commandes
  const filteredOrders = purchaseHistory
    .filter((order) => {
      const matchesSearch = order.items.some((item) =>
        item.produit_nom.toLowerCase().includes(searchQuery.toLowerCase())
      ) || order.order_id.includes(searchQuery);
      const matchesDate =
        (!dateRange.start || new Date(order.created_at) >= new Date(dateRange.start)) &&
        (!dateRange.end || new Date(order.created_at) <= new Date(dateRange.end));
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' ? a.total_montant - b.total_montant : b.total_montant - a.total_montant;
      }
    });

  // Gérer le tri
  const handleSort = (column: 'date' | 'total') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Historique de mes achats</h1>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Rechercher par produit ou ID commande..."
              className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <input
              type="date"
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>

        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Chargement...</span>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            {error}
          </div>
        )}

        {/* Liste des achats */}
        {!isLoading && !error && filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            Aucun achat correspondant aux critères.
          </div>
        )}

        {!isLoading && filteredOrders.length > 0 && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 flex justify-between text-sm font-medium text-gray-500 uppercase tracking-wider">
              <div className="w-1/4 cursor-pointer" onClick={() => handleSort('date')}>
                Date {sortBy === 'date' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </div>
              <div className="w-1/4">Commande</div>
              <div className="w-1/4">Articles</div>
              <div className="w-1/4 text-right cursor-pointer" onClick={() => handleSort('total')}>
                Total {sortBy === 'total' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </div>
            </div>
            {filteredOrders.map((order) => (
              <div key={order.order_id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-1/4">
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="w-1/4">
                    <p className="text-lg font-semibold text-gray-800">#{order.order_id}</p>
                  </div>
                  <div className="w-1/4">
                    {order.items.map((item, index) => (
                      <div key={index} className="mb-2">
                        <p className="text-gray-900">{item.produit_nom}</p>
                        <p className="text-sm text-gray-500">
                          x{item.quantite} à {item.prix.toFixed(2)} € = {item.total.toFixed(2)} €
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="w-1/4 text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {order.total_montant.toFixed(2)} €
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;
