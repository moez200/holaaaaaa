import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download } from 'lucide-react';
import axios from 'axios';
import { Order } from '../types';
import { useAuthStore } from '../components/Store/authStore';
import StatusBadge from './ui/StatusBadge';


// Définir l'URL de l'API avec une valeur par défaut
const API_URL = 'http://localhost:8000/cart/';

interface OrderResponse {
  id: string;
  client: { user: { nom: string; prenom: string; email: string } };
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  total: string;
  created_at: string;
  updated_at: string;
  items: Array<{
    id: number;
    produit: { id: number; nom: string; prix: string };
    quantite: number;
    prix: string;
  }>;
  status: string;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'total'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [amountRange, setAmountRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const statuses = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching orders from:', `${API_URL}orders/`, 'with params:', {
          page,
          search: searchQuery,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          date_start: dateRange.start || undefined,
          date_end: dateRange.end || undefined,
          amount_min: amountRange.min || undefined,
          amount_max: amountRange.max || undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
        });
        const response = await axios.get(`${API_URL}orders/`, {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
          },
          params: {
            page,
            search: searchQuery,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            date_start: dateRange.start || undefined,
            date_end: dateRange.end || undefined,
            amount_min: amountRange.min || undefined,
            amount_max: amountRange.max || undefined,
            sort_by: sortBy,
            sort_order: sortOrder,
          },
        });

        console.log('API response:', response.data);

        const formattedOrders: Order[] = response.data.results.map((order: OrderResponse) => ({
          id: order.id,
          customerName: `${order.client.user.nom} ${order.client.user.prenom}`,
          customerEmail: order.client.user.email,
          date: order.created_at,
          total: parseFloat(order.total),
          status: order.status,
          items: order.items.map(item => ({
            id: item.id,
            productName: item.produit.nom,
            quantity: item.quantite,
            price: parseFloat(item.prix),
          })),
          shippingInfo: {
            firstName: order.first_name,
            lastName: order.last_name,
            email: order.email,
            phone: order.phone,
            address: order.address,
            city: order.city,
            postalCode: order.postal_code,
          },
        }));

        setOrders(formattedOrders);
        setTotalPages(Math.ceil(response.data.count / 10)); // Assuming 10 orders per page
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'Erreur inconnue lors du chargement des commandes';
        setError(errorMessage);
        console.error('Fetch orders error:', err, 'Response:', err.response?.data, 'Status:', err.response?.status);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [page, searchQuery, statusFilter, sortBy, sortOrder, dateRange, amountRange]);

  // Update order status
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await axios.patch(
        `${API_URL}orders/${orderId}/`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
          },
        }
      );
      setOrders(orders.map(order =>
        order.id === Number(orderId) ? { ...order, status: newStatus } : order
      ));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erreur lors de la mise à jour du statut';
      setError(errorMessage);
      console.error('Update status error:', err.response?.data);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Client', 'Email', 'Date', 'Montant', 'Statut', 'Articles'];
    const rows = orders.map(order => [
      order.id,
      order.first_name,
      order.last_name,
      new Date(order.date).toLocaleDateString('fr-FR'),
      order.total.toFixed(2),
      order.status,
      order.items.map(item => `${item.produit} (x${item.quantite})`).join(';'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'orders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter, sort and search orders (client-side fallback)
  const filteredOrders = orders
    .filter(order =>
      (statusFilter === 'all' || order.status === statusFilter) &&
      (order.id.toString().includes(searchQuery) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!dateRange.start || new Date(order.date) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(order.date) <= new Date(dateRange.end)) &&
      (!amountRange.min || order.total >= parseFloat(amountRange.min)) &&
      (!amountRange.max || order.total <= parseFloat(amountRange.max))
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' ? a.total - b.total : b.total - a.total;
      }
    });

  const handleSort = (column: 'date' | 'total') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const openDetailsModal = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Commandes</h1>
        <p className="text-gray-500">Suivez et gérez les commandes de vos clients</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Rechercher par ID ou client..."
            className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'Tous statuts' : status}
              </option>
            ))}
          </select>
          <input
            type="date"
            placeholder="Date de début"
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
          <input
            type="date"
            placeholder="Date de fin"
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
          <input
            type="number"
            placeholder="Montant min"
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={amountRange.min}
            onChange={(e) => setAmountRange({ ...amountRange, min: e.target.value })}
          />
          <input
            type="number"
            placeholder="Montant max"
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={amountRange.max}
            onChange={(e) => setAmountRange({ ...amountRange, max: e.target.value })}
          />
          <button
            onClick={exportToCSV}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center"
          >
            <Download size={18} className="mr-2 text-gray-500" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Error and Loading */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          {error}
        </div>
      )}
      {isLoading && (
        <div className="text-center py-4">
          <p className="text-gray-500">Chargement des commandes...</p>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Commande
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {sortBy === 'date' && (
                      <span className="ml-2">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center">
                    Montant
                    {sortBy === 'total' && (
                      <span className="ml-2">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">#{order.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-sm text-gray-500">{order.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(order.date).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.total.toFixed(2)} €</div>
                    <div className="text-sm text-gray-500">{order.items.length} articles</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => openDetailsModal(order)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye size={18} />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
        >
          Précédent
        </button>
        <span>Page {page} sur {totalPages}</span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
        >
          Suivant
        </button>
      </div>

      {/* Order Details Modal */}
      {isDetailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <OrderDetails
                order={selectedOrder}
                onClose={() => setIsDetailsModalOpen(false)}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;