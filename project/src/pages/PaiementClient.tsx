
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Download, SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown, CreditCard, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import paymentService from '../services/PaimentService';

interface PaymentData {
  id: string;
  order_id: number;
  tranche: number;
  montant: string;
  montant_initial: string;
  date_ordre: string;
  date_echeance: string;
  statut: string;
  statut_display: string;
  type_remise: string;
  type_remise_display: string;
  remise_appliquee: string;
  pourcentage_remise: string;
  montant_apres_remise: string;
  montant_paye?: number;
  duree_plan_paiement: string;
}

interface Totals {
  total_montant_initial: string;
  total_remise: string;
  total_apres_remise: string;
  total_paye: string;
}

const formatCurrency = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(num);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'payée':
      case 'delivered':
        return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'en attente':
      case 'pending':
        return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      case 'en traitement':
      case 'processing':
        return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case 'expédiée':
      case 'shipped':
        return 'bg-indigo-50 text-indigo-700 ring-indigo-600/20';
      case 'annulée':
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 ring-gray-600/20';
      default:
        return 'bg-gray-100 text-gray-700 ring-gray-600/20';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium ring-1 ring-inset ${getStatusStyles(status)} transition-all duration-300 transform hover:scale-105`}>
      {status}
    </span>
  );
};

const DiscountBadge: React.FC<{ type: string }> = ({ type }) => {
  const getDiscountStyles = (type: string) => {
    switch (type.toLowerCase()) {
      case 'remise par tranches':
        return 'bg-purple-50 text-purple-700 ring-purple-600/20';
      case 'remise à la fin de paiement':
        return 'bg-pink-50 text-pink-700 ring-pink-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium ring-1 ring-inset ${getDiscountStyles(type)} transition-all duration-300 transform hover:scale-105`}>
      {type}
    </span>
  );
};

const PaiementClient: React.FC = () => {
  const { state } = useLocation();
  const { client_id, order_id } = state || { client_id: 0, order_id: 0 };
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [totals, setTotals] = useState<Totals>({
    total_montant_initial: '0.00',
    total_remise: '0.00',
    total_apres_remise: '0.00',
    total_paye: '0.00',
  });
  const [orderStatus, setOrderStatus] = useState<string>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof PaymentData | null;
    direction: 'ascending' | 'descending';
  }>({ key: null, direction: 'ascending' });
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);
  const [showPayTotalModal, setShowPayTotalModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await paymentService.getPayments(client_id, order_id);
        console.log('Fetched Payments:', response);
  
        setPayments(
          response.payments.map((item: PaymentData) => ({
            ...item,
            montant_paye: typeof item.montant_paye === 'string' ? parseFloat(item.montant_paye) || 0 : item.montant_paye || 0,
          }))
        );
        setTotals(response.totals);
        setOrderStatus(response.order_status);
      } catch (err: any) {
        console.error('Fetch Payments Error:', err);
        setError(err.message || 'Erreur lors de la récupération des paiements');
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    if (client_id && order_id) {
      fetchPayments();
    } else {
      setError('Client ID ou Order ID manquant');
      setLoading(false);
    }
  }, [client_id, order_id]);

  const filteredPayments = payments.filter(
    (payment) =>
      payment.tranche.toString().includes(searchTerm) ||
      payment.montant.includes(searchTerm) ||
      payment.date_echeance.includes(searchTerm) ||
      payment.statut.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.type_remise.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const requestSort = (key: keyof PaymentData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof PaymentData) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-5 w-5 opacity-30" />;
    }
    return sortConfig.direction === 'ascending'
      ? <ArrowUp className="h-5 w-5 text-pink-500" />
      : <ArrowDown className="h-5 w-5 text-pink-500" />;
  };

  const handlePayment = (payment: PaymentData) => {
    setSelectedPayment(payment);
  };

  const confirmPayment = async (payment: PaymentData) => {
    try {
      console.log('Paying tranche:', { client_id, order_id, tranche: payment.tranche });
      const updatedPayment = await paymentService.payTranche(client_id, order_id, payment.tranche);
      console.log('Updated Payment:', updatedPayment);
      toast.success(`Paiement de ${formatCurrency(parseFloat(payment.montant_apres_remise))} effectué !`);
  
      // Update the specific payment immediately
      setPayments((prev) =>
        prev.map((p) =>
          p.id === updatedPayment.id ? updatedPayment : p
        )
      );

      // Re-fetch all payments to ensure consistency
      const response = await paymentService.getPayments(client_id, order_id);
      console.log('Re-fetched Payments:', response.payments);
      setPayments(
        response.payments.map((item: PaymentData) => ({
          ...item,
          montant_paye: item.montant_paye ? parseFloat(item.montant_paye as any) : 0,
        }))
      );
      setTotals(response.totals);
      setOrderStatus(response.order_status);
      setSelectedPayment(null);
    } catch (err: any) {
      console.error('Payment Error:', err);
      toast.error(err.message || 'Erreur lors du traitement du paiement');
    }
  };

  const confirmPayTotal = async () => {
    try {
      const remainingAmount = parseFloat(totals.total_apres_remise) - parseFloat(totals.total_paye);
      if (remainingAmount <= 0) {
        toast.error('Aucun montant restant à payer.');
        return;
      }

      await paymentService.payTotal(client_id, order_id);
      toast.success(`Paiement total de ${formatCurrency(remainingAmount)} effectué !`);

      // Re-fetch payments to update all tranches
      const response = await paymentService.getPayments(client_id, order_id);
      setPayments(
        response.payments.map((item: PaymentData) => ({
          ...item,
          montant_paye: item.montant_paye ? parseFloat(item.montant_paye as any) : 0,
        }))
      );
      setTotals(response.totals);
      setOrderStatus(response.order_status);
      setShowPayTotalModal(false);
    } catch (err: any) {
      console.error('Pay Total Error:', err);
      toast.error(err.message || 'Erreur lors du paiement total');
    }
  };

  useEffect(() => {
    if (sortConfig.key) {
      const sortedPayments = [...payments].sort((a, b) => {
        const aValue = typeof a[sortConfig.key!] === 'string' ? parseFloat(a[sortConfig.key!] as string) || a[sortConfig.key!] : a[sortConfig.key!] ?? 0;
        const bValue = typeof b[sortConfig.key!] === 'string' ? parseFloat(b[sortConfig.key!] as string) || b[sortConfig.key!] : b[sortConfig.key!] ?? 0;
        if ((aValue ?? 0) < (bValue ?? 0)) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if ((aValue ?? 0) > (bValue ?? 0)) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
      setPayments(sortedPayments);
    }
  }, [sortConfig]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-fuchsia-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl border border-pink-100">
          <div className="p-6 md:p-8 border-b border-pink-100 bg-gradient-to-r from-pink-500 to-purple-600">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Échéancier de Paiement</h1>
            <p className="text-pink-100">Gérez vos paiements pour la commande #{order_id}</p>
            <div className="mt-2">
              <span className="text-white font-medium">Statut de la commande : </span>
              <StatusBadge status={orderStatus} />
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-pink-500/5 to-purple-500/5 border-b border-pink-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-100">
                <div className="text-sm text-gray-500">Total Montant Initial</div>
                <div className="text-xl font-bold text-gray-900">{formatCurrency(totals.total_montant_initial)}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-100">
                <div className="text-sm text-gray-500">Total Remise</div>
                <div className="text-xl font-bold text-blue-600">{formatCurrency(totals.total_remise)}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-100">
                <div className="text-sm text-gray-500">Total Après Remise</div>
                <div className="text-xl font-bold text-green-600">{formatCurrency(totals.total_apres_remise)}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-100">
                <div className="text-sm text-gray-500">Reste à Payer</div>
                <div className="text-xl font-bold text-pink-600">{formatCurrency(parseFloat(totals.total_apres_remise) - parseFloat(totals.total_paye))}</div>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowPayTotalModal(true)}
                className="w-full md:w-auto px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 text-white hover:opacity-90 flex items-center gap-2 transition-all duration-200 shadow-sm"
                disabled={parseFloat(totals.total_apres_remise) <= parseFloat(totals.total_paye)}
              >
                <Wallet className="h-5 w-5" />
                Payer le montant total
              </button>
            </div>
          </div>

          <div className="p-4 md:p-6 border-b border-pink-100 bg-white/50 backdrop-blur-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                placeholder="Rechercher un paiement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button className="bg-white px-4 py-2 rounded-lg border border-pink-200 text-gray-600 hover:bg-pink-50 flex items-center gap-2 transition-all duration-200">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden md:inline">Filtres</span>
              </button>
              <button className="bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 rounded-lg text-white hover:opacity-90 flex items-center gap-2 transition-all duration-200 shadow-sm">
                <Download className="h-4 w-4" />
                <span className="hidden md:inline">Exporter</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-pink-500/5 to-purple-500/5">
                  {[
                    { key: 'tranche', label: 'Tranche' },
                    { key: 'montant_initial', label: 'Montant initial' },
                    { key: 'remise_appliquee', label: 'Remise appliquée' },
                    { key: 'pourcentage_remise', label: '% de remise' },
                    { key: 'montant_apres_remise', label: 'Montant après remise' },
                    { key: 'date_echeance', label: 'Date d\'échéance' },
                    { key: 'statut', label: 'Statut' },
                    { key: 'type_remise', label: 'Type de remise' },
                    { key: 'montant_paye', label: 'Montant payé' },
                    { key: 'actions', label: 'Actions' },
                  ].map((column) => (
                    <th
                      key={column.key}
                      className="px-8 py-6 text-left text-base font-medium text-gray-500 uppercase tracking-wider cursor-pointer min-w-[180px] sm:min-w-[200px]"
                      onClick={() => column.key !== 'actions' && requestSort(column.key as keyof PaymentData)}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        {column.key !== 'actions' && getSortIcon(column.key as keyof PaymentData)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-pink-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-purple-50/50 transition-colors duration-150">
                    <td className="px-8 py-6 whitespace-nowrap text-base font-medium text-gray-900 min-w-[180px] sm:min-w-[200px]">
                      {payment.tranche}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 min-w-[180px] sm:min-w-[200px]">
                      {formatCurrency(payment.montant_initial)}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 min-w-[180px] sm:min-w-[200px]">
                      {formatCurrency(payment.remise_appliquee)}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 min-w-[180px] sm:min-w-[200px]">
                      {payment.pourcentage_remise}%
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-base font-medium text-gray-900 min-w-[180px] sm:min-w-[200px]">
                      {formatCurrency(payment.montant_apres_remise)}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 min-w-[180px] sm:min-w-[200px]">
                      {formatDate(payment.date_echeance)}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap min-w-[180px] sm:min-w-[200px]">
                      <StatusBadge status={payment.statut_display} />
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap min-w-[180px] sm:min-w-[200px]">
                      <DiscountBadge type={payment.type_remise_display} />
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-base font-medium min-w-[180px] sm:min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-pink-500" />
                        <span className={payment.montant_paye && payment.montant_paye > 0 ? 'text-green-600' : 'text-gray-400'}>
                          {formatCurrency(payment.montant_paye || 0)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-base text-gray-500 min-w-[180px] sm:min-w-[200px]">
                      {payment.statut.toLowerCase() !== 'payée' && (
                        <button
                          onClick={() => handlePayment(payment)}
                          className="inline-flex items-center px-4 py-1.5 rounded-md bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 transition-opacity duration-200 text-base"
                        >
                          <Wallet className="h-5 w-5 mr-2" />
                          Payer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 md:p-6 border-t border-pink-100 bg-white/50 backdrop-blur-sm text-sm text-gray-500 flex justify-between items-center">
            <div>
              Affichage de {filteredPayments.length} paiements sur {payments.length}
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg border border-pink-200 hover:bg-pink-50 transition-colors">Précédent</button>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 transition-opacity">Suivant</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Paying a Single Tranche */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Paiement de la tranche {selectedPayment.tranche}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Montant initial</label>
                  <div className="text-lg font-medium text-gray-900">{formatCurrency(selectedPayment.montant_initial)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Remise</label>
                  <div className="text-lg font-medium text-blue-600">{formatCurrency(selectedPayment.remise_appliquee)} ({selectedPayment.pourcentage_remise}%)</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Montant à payer</label>
                <div className="text-2xl font-bold text-pink-600">
                  {formatCurrency(parseFloat(selectedPayment.montant_apres_remise) - (selectedPayment.montant_paye || 0))}
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => confirmPayment(selectedPayment)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-md hover:opacity-90 transition-opacity"
                >
                  Confirmer le paiement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Paying Total */}
      {showPayTotalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Paiement du montant total
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Montant total à payer</label>
                <div className="text-2xl font-bold text-pink-600">
                  {formatCurrency(parseFloat(totals.total_apres_remise) - parseFloat(totals.total_paye))}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Cela marquera toutes les tranches comme payées.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowPayTotalModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmPayTotal}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-md hover:opacity-90 transition-opacity"
                >
                  Confirmer le paiement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaiementClient;