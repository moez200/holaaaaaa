import React, { useState } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Order } from '../../data/mockData';
import StatusBadge from './StatusBadge';

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, newStatus: string) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onClose, onStatusChange }) => {
  const [currentStatus, setCurrentStatus] = useState(order.status);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setCurrentStatus(newStatus);
    onStatusChange(order.id, newStatus);
  };

  const statusOptions = [
    'En attente',
    'Payée',
    'En préparation',
    'Expédiée',
    'Livrée',
    'Annulée',
    'Remboursée'
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Commande #{order.id}
          </h3>
          <p className="text-sm text-gray-500">
            Passée le {new Date(order.date).toLocaleDateString('fr-FR')} à {new Date(order.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex space-x-2">
          <button className="text-gray-400 hover:text-gray-500">
            <Printer size={20} />
          </button>
          <button className="text-gray-400 hover:text-gray-500">
            <Download size={20} />
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Status and Actions */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-sm text-gray-500 block mb-1">Statut</span>
          <StatusBadge status={currentStatus} />
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={currentStatus}
            onChange={handleStatusChange}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200">
            Mettre à jour
          </button>
        </div>
      </div>

      {/* Order Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Customer Info */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Information Client</h4>
          <div className="space-y-2">
            <p className="text-sm text-gray-800 font-medium">{order.customerName}</p>
            <p className="text-sm text-gray-600">{order.customerEmail}</p>
            <p className="text-sm text-gray-600">{order.customerPhone || 'Téléphone non renseigné'}</p>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Adresse de Livraison</h4>
          <div className="space-y-2">
            <p className="text-sm text-gray-800 font-medium">{order.customerName}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress?.street}</p>
            <p className="text-sm text-gray-600">
              {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
            </p>
            <p className="text-sm text-gray-600">{order.shippingAddress?.country}</p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Information Paiement</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Méthode</span>
              <span className="text-sm text-gray-800 font-medium">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Carte</span>
              <span className="text-sm text-gray-800">**** **** **** {order.lastFourDigits || '1234'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Statut</span>
              <span className="text-sm text-green-600 font-medium">Payé</span>
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Information Livraison</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Méthode</span>
              <span className="text-sm text-gray-800 font-medium">{order.shippingMethod || 'Standard'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Coût</span>
              <span className="text-sm text-gray-800">{order.shippingCost?.toFixed(2) || '0.00'} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Numéro de suivi</span>
              <span className="text-sm text-blue-600">{order.trackingNumber || 'Non disponible'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Articles Commandés</h4>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix unitaire
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item) => (
                <tr key={item.productId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 mr-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.sku || 'SKU non disponible'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {item.price.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {(item.price * item.quantity).toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Sous-total</span>
            <span className="text-sm text-gray-800">
              {order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)} €
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Frais de livraison</span>
            <span className="text-sm text-gray-800">{order.shippingCost?.toFixed(2) || '0.00'} €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Taxes</span>
            <span className="text-sm text-gray-800">{order.tax?.toFixed(2) || '0.00'} €</span>
          </div>
          <div className="border-t border-gray-300 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-900">Total</span>
              <span className="text-sm font-medium text-gray-900">{order.total.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;