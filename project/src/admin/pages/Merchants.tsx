import { useState, useEffect } from 'react';
import { Search, Filter, Download, MoreHorizontal, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { UserService } from '../../services/userService';
import { UserAdmin } from '../../types';

// Utility to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? 'N/A'
    : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Derive status from is_approved and is_active
const getMerchantStatus = (user: UserAdmin): string => {
  if (!user.is_approved) return 'pending';
  if (user.is_approved && user.is_active) return 'active';
  return 'rejected';
};

interface Merchant {
  id: number;
  name: string;
  owner: string;
  email: string;
  telephone: string;
  status: string;
  joined: string;
}

const Merchants = () => {
  // State management
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    merchantId: number | null;
    action: string;
  }>({ open: false, merchantId: null, action: '' });
  const [notificationMessage, setNotificationMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch merchants on component mount
  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setLoading(true);
        const users = await UserService.getUsers();
        const filteredMerchants: Merchant[] = users
          .filter((user: UserAdmin) => user.role === 'marchand')
          .map((user: UserAdmin) => ({
            id: user.id,
            name: `${user.prenom} ${user.nom}`,
            owner: `${user.prenom} ${user.nom}`,
            email: user.email,
            telephone: user.telephone,
            status: getMerchantStatus(user),
            joined: user.created_at ? formatDate(user.created_at) : 'N/A',
          }));
        setMerchants(filteredMerchants);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch merchants';
        setError(errorMessage);
        setNotificationMessage({ text: 'Error fetching merchants', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchMerchants();
  }, []);

  // Stats for the dashboard
  const stats = {
    total: merchants.length,
    active: merchants.filter((m) => m.status === 'active').length,
    pending: merchants.filter((m) => m.status === 'pending').length,
    rejected: merchants.filter((m) => m.status === 'rejected').length,
  };

  // Generate status badge color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle merchant status change
  const handleStatusChange = async (merchantId: number, newStatus: string) => {
    try {
      let updatedMerchant: UserAdmin;
      const merchant = merchants.find((m) => m.id === merchantId);
      if (!merchant) throw new Error('Merchant not found');

      if (newStatus === 'active') {
        updatedMerchant = await UserService.approveUser(merchantId);
        updatedMerchant = await UserService.updateUser(merchantId, { is_active: true });
      } else if (newStatus === 'rejected') {
        updatedMerchant = await UserService.rejectUser(merchantId);
      } else {
        throw new Error('Invalid status');
      }

      // Update local state
      setMerchants(prevMerchants =>
        prevMerchants.map((m) =>
          m.id === merchantId
            ? {
                ...m,
                status: newStatus,
                email: updatedMerchant.email,
                name: `${updatedMerchant.prenom} ${updatedMerchant.nom}`,
                owner: `${updatedMerchant.prenom} ${updatedMerchant.nom}`,
                telephone: updatedMerchant.telephone,
                joined: updatedMerchant.created_at ? formatDate(updatedMerchant.created_at) : m.joined,
              }
            : m
        )
      );

      // Show notification
      const message =
        newStatus === 'active'
          ? `${merchant.name} has been approved and activated`
          : `${merchant.name} application has been rejected`;
      setNotificationMessage({
        text: message,
        type: newStatus === 'active' ? 'success' : 'error',
      });
      setTimeout(() => setNotificationMessage(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating merchant status';
      setNotificationMessage({
        text: errorMessage,
        type: 'error',
      });
    } finally {
      setConfirmDialog({ open: false, merchantId: null, action: '' });
    }
  };

  // Handle merchant deletion
  const handleDeleteMerchant = async (merchantId: number) => {
    try {
      await UserService.deleteUser(merchantId);
      setMerchants(prevMerchants => prevMerchants.filter((m) => m.id !== merchantId));
      setConfirmDialog({ open: false, merchantId: null, action: '' });
      setNotificationMessage({ text: 'Merchant deleted successfully', type: 'success' });
      setTimeout(() => setNotificationMessage(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting merchant';
      setNotificationMessage({ text: errorMessage, type: 'error' });
    }
  };

  // Filter merchants based on search term and status filter
  const filteredMerchants = merchants.filter((merchant) => {
    const matchesSearch =
      merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.telephone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || merchant.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Notification component
  const Notification = () => {
    if (!notificationMessage) return null;
    const getNotificationStyle = () => {
      switch (notificationMessage.type) {
        case 'success':
          return 'bg-green-50 border-green-500 text-green-700';
        case 'error':
          return 'bg-red-50 border-red-500 text-red-700';
        default:
          return 'bg-blue-50 border-blue-500 text-blue-700';
      }
    };
    return (
      <div
        className={`fixed top-4 right-4 p-4 rounded-lg shadow-md border-l-4 ${getNotificationStyle()} max-w-md animate-fade-in-right`}
      >
        <div className="flex">
          {notificationMessage.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
          {notificationMessage.type === 'error' && <XCircle className="h-5 w-5 mr-2" />}
          <span>{notificationMessage.text}</span>
        </div>
      </div>
    );
  };

  // Confirmation dialog component
  const ConfirmationDialog = () => {
    if (!confirmDialog.open) return null;
    const merchant = merchants.find((m) => m.id === confirmDialog.merchantId);
    let title, message, confirmText, confirmColor;
    switch (confirmDialog.action) {
      case 'approve':
        title = 'Approve Merchant';
        message = `Are you sure you want to approve ${merchant?.name}? This will grant them full access to the platform.`;
        confirmText = 'Approve';
        confirmColor = 'bg-green-600 hover:bg-green-700';
        break;
      case 'reject':
        title = 'Reject Merchant';
        message = `Are you sure you want to reject ${merchant?.name}'s application? This action cannot be undone.`;
        confirmText = 'Reject';
        confirmColor = 'bg-red-600 hover:bg-red-700';
        break;
      case 'delete':
        title = 'Delete Merchant';
        message = `Are you sure you want to delete ${merchant?.name}? This action cannot be undone.`;
        confirmText = 'Delete';
        confirmColor = 'bg-red-600 hover:bg-red-700';
        break;
      default:
        return null;
    }
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setConfirmDialog({ open: false, merchantId: null, action: '' })}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (confirmDialog.action === 'delete') {
                  handleDeleteMerchant(confirmDialog.merchantId!);
                } else {
                  const newStatus = confirmDialog.action === 'approve' ? 'active' : 'rejected';
                  handleStatusChange(confirmDialog.merchantId!, newStatus);
                }
              }}
              className={`px-4 py-2 text-white rounded-lg ${confirmColor}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Get stat icon
  const getStatIcon = (title: string) => {
    switch (title) {
      case 'Total Merchants':
        return <CheckCircle className="w-6 h-6" />;
      case 'Active Merchants':
        return <CheckCircle className="w-6 h-6" />;
      case 'Pending Approval':
        return <XCircle className="w-6 h-6" />;
      case 'Rejected':
        return <XCircle className="w-6 h-6" />;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading merchants...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-5 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">Merchant Management</h2>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search merchants..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <Filter size={16} className="text-gray-500" />
              </div>
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center hover:bg-gray-50">
              <Download size={16} className="mr-2 text-gray-500" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: 'Total Merchants', value: stats.total, change: '+12%', color: 'bg-blue-50 text-blue-700' },
          { title: 'Active Merchants', value: stats.active, change: '+8%', color: 'bg-green-50 text-green-700' },
          { title: 'Pending Approval', value: stats.pending, change: '-5%', color: 'bg-yellow-50 text-yellow-700' },
          { title: 'Rejected', value: stats.rejected, change: '+2%', color: 'bg-red-50 text-red-700' },
        ].map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              {getStatIcon(stat.title)}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-500">{stat.title}</p>
            <p className="text-xs mt-2">
              <span className={stat.change.includes('+') ? 'text-green-600' : 'text-red-600'}>{stat.change}</span> from
              last month
            </p>
          </div>
        ))}
      </div>

      {/* Merchants Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telephone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredMerchants.length > 0 ? (
                filteredMerchants.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                          {merchant.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{merchant.name}</div>
                          <div className="text-xs text-gray-500">
                            <span className="mr-1">{merchant.owner}</span> • <span className="ml-1">{merchant.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.telephone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(
                          merchant.status
                        )}`}
                      >
                        {merchant.status.charAt(0).toUpperCase() + merchant.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{merchant.joined}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          className="p-1 rounded-full hover:bg-green-100 text-gray-500 hover:text-green-600"
                          title="Approve Merchant"
                          onClick={() =>
                            setConfirmDialog({ open: true, merchantId: merchant.id, action: 'approve' })
                          }
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          className="p-1 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-600"
                          title="Reject Merchant"
                          onClick={() =>
                            setConfirmDialog({ open: true, merchantId: merchant.id, action: 'reject' })
                          }
                        >
                          <XCircle size={16} />
                        </button>
                        <button
                          className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-600"
                          title="Delete"
                          onClick={() => setConfirmDialog({ open: true, merchantId: merchant.id, action: 'delete' })}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button className="p-1 rounded-full hover:bg-gray-100 text-gray-500" title="More Options">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No merchants found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">Showing {filteredMerchants.length} of {merchants.length} merchants</p>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 bg-indigo-50 text-indigo-600 font-medium rounded text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm">2</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm">3</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm">Next</button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog />

      {/* Notification */}
      <Notification />
    </div>
  );
};

export default Merchants;