import React, { useState, useEffect } from 'react';
import { Award, Gift, ShoppingBag, Users } from 'lucide-react';
import { Badge, Customer } from '../../../types';
import { customerService } from '../../../services/CustemoreService';
import { badgeService } from '../../../services/BadgeService';

const CustomerOverview: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch customers and badges on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerData, badgeData] = await Promise.all([
          customerService.getCustomers(),
          badgeService.getBadges(),
        ]);
        setCustomers(customerData);
        setBadges(badgeData);
        console.log('customers',customerData,badgeData)
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      }
    };
    fetchData();
  }, []);

  const totalCustomers = customers.length;
  const totalOrders = customers.reduce((sum, customer) => sum + customer.orders, 0);
  const totalReferrals = customers.reduce((sum, customer) => sum + customer.referrals, 0);

  const badgeCounts = badges.reduce(
    (acc, badge) => {
      acc[badge.name] = customers.filter((c) => c.currentBadge?.id === badge.id).length;
      return acc;
    },
    { 'No Badge': customers.filter((c) => !c.currentBadge).length } as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Customers"
          value={totalCustomers}
          icon={<Users className="text-blue-400" size={24} />}
          trend={{
            value: '+12%',
            label: 'vs last month',
            positive: true,
          }}
        />
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={<ShoppingBag className="text-green-400" size={24} />}
          trend={{
            value: '+8%',
            label: 'vs last month',
            positive: true,
          }}
        />
        <StatCard
          title="Total Referrals"
          value={totalReferrals}
          icon={<Gift className="text-indigo-400" size={24} />}
          trend={{
            value: '+15%',
            label: 'vs last month',
            positive: true,
          }}
        />
        <StatCard
          title="Avg Orders / Customer"
          value={totalCustomers ? (totalOrders / totalCustomers).toFixed(1) : '0.0'}
          icon={<Award className="text-purple-400" size={24} />}
          trend={{
            value: '+3%',
            label: 'vs last month',
            positive: true,
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Loyalty Badge Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(badgeCounts).map(([badgeName, count]) => {
              const badge = badges.find((b) => b.name === badgeName);
              const percentage = totalCustomers ? (count / totalCustomers) * 100 : 0;

              return (
                <div key={badgeName}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      {badge && (
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: badge.color }}></div>
                      )}
                      <span className="text-sm font-medium text-gray-700">{badgeName}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {count} ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                  <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${percentage}%`, backgroundColor: badge?.color || '#9CA3AF' }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Top Customers by Referrals
          </h3>
          <div className="space-y-4">
            {customers
              .sort((a, b) => b.referrals - a.referrals)
              .slice(0, 5)
              .map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 flex items-center justify-center text-white font-medium shadow-sm">
                      {customer.nom.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{customer.nom}</p>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                      {customer.currentBadge ? (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: customer.currentBadge.color }}></div>
                          <span className="text-sm font-medium text-gray-700">
                            {customer.currentBadge.name} ({customer.currentBadge.discount}% off)
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 mt-1">No badge yet</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        <Gift size={16} className="text-indigo-400" />
                        <span className="font-medium text-gray-800">{customer.referrals}</span>
                      </div>
                      <span className="text-xs text-gray-500">Referrals</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        <ShoppingBag size={16} className="text-green-400" />
                        <span className="font-medium text-gray-800">{customer.orders}</span>
                      </div>
                      <span className="text-xs text-gray-500">Orders</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">All Customers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Referrals</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Current Badge</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Discounts</th>
              </tr>
            </thead>
           <tbody className="divide-y divide-gray-100">
  {customers.map((customer) => (
    <tr key={customer.id} className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 flex items-center justify-center text-white font-medium text-sm shadow-sm">
            {customer.nom.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-800">{customer.nom}</p>
            <p className="text-sm text-gray-500">{customer.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5">
          <ShoppingBag size={16} className="text-green-400" />
          <span className="text-gray-800">{customer.orders}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5">
          <Gift size={16} className="text-indigo-400" />
          <span className="text-gray-800">{customer.referrals}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        {customer.currentBadge ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: customer.currentBadge.color }}></div>
            <span className="font-medium text-gray-800">{customer.currentBadge.name}</span>
          
          </div>
        ) : (
          <span className="text-gray-500">No badge yet</span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {customer.currentBadge ? (
            <div
              key={customer.currentBadge.id}
              className="px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-600"
            >
              {customer.currentBadge.discount}% 
            </div>
          ) : (
            <span className="text-gray-500">No discounts</span>
          )}
        </div>
      </td>
    </tr>
  ))}
</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    label: string;
    positive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 transition-all duration-300 hover:shadow-lg border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-medium ${trend.positive ? 'text-green-500' : 'text-red-500'}`}
              >
                {trend.value}
              </span>
              <span className="text-xs text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        <div className="bg-gray-50 p-3 rounded-lg shadow-sm">{icon}</div>
      </div>
    </div>
  );
};

export default CustomerOverview;