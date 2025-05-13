import React, { useState, useEffect } from 'react';
import { Gift, Calendar, User } from 'lucide-react';
import { Customer } from '../../../types';
import { customerService } from '../../../services/CustemoreService';


const ReferralHistory: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await customerService.getCustomers();
        setCustomers(data);
        console.log('gggg',data)
        console.log('fetched client',data)
      } catch (err) {
        setError('Failed to load customers. Please try again.');
      }
    };
    fetchCustomers();
  }, []);

  const allDiscounts = customers.flatMap((customer) =>
    (customer.appliedDiscounts || []).map((discount) => ({
      ...discount,
      customerName: customer.nom,
      customerEmail: customer.email,
    }))
  );

  const sortedDiscounts = allDiscounts.sort(
    (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
  );

  const referralDiscounts = sortedDiscounts.filter((discount) =>
    discount.name.toLowerCase().includes('referral')
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 mt-6 border border-gray-100">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>
      )}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Referral Rewards History</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-100">
              <th className="pb-3 font-medium text-gray-500">Customer</th>
              <th className="pb-3 font-medium text-gray-500">Discount</th>
              <th className="pb-3 font-medium text-gray-500">Value</th>
              <th className="pb-3 font-medium text-gray-500">Applied At</th>
            </tr>
          </thead>
          <tbody>
            {referralDiscounts.length > 0 ? (
              referralDiscounts.map((discount, index) => (
                <tr
                  key={discount.id}
                  className={`${index !== referralDiscounts.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50 transition-colors duration-150`}
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{discount.customerName}</p>
                        <p className="text-xs text-gray-500">{discount.customerEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <Gift size={16} />
                      </div>
                      <span className="text-gray-800">{discount.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="inline-block px-2.5 py-1 rounded-full text-sm font-medium bg-green-50 text-green-600">
                      {discount.value}%
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span>{formatDate(discount.appliedAt)}</span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  No referral discounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReferralHistory;