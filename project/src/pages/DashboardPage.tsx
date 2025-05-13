import React from 'react';

import { orders, dashboardStats } from '../data/mockData';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import StatCard from '../dashboard/ui/StatCard';

const DashboardPage: React.FC = () => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your store today.</p>
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(dashboardStats.totalRevenue)}
          icon={<DollarSign size={24} />}
          change={{ value: 12.5, type: 'increase' }}
        />
        <StatCard 
          title="Total Orders" 
          value={dashboardStats.totalOrders}
          icon={<ShoppingCart size={24} />}
          change={{ value: 8.2, type: 'increase' }}
        />
        <StatCard 
          title="Total Customers" 
          value={dashboardStats.totalCustomers}
          icon={<Users size={24} />}
          change={{ value: 5.3, type: 'increase' }}
        />
        <StatCard 
          title="Total Products" 
          value={dashboardStats.totalProducts}
          icon={<Package size={24} />}
          change={{ value: 2.1, type: 'decrease' }}
        />
      </div>
      
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart salesData={dashboardStats.recentSales} />
        </div>
        <div>
          <OrderStatusDoughnut ordersByStatus={dashboardStats.ordersByStatus} />
        </div>
      </div>
      
      {/* Products and Orders row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <TopProductsCard products={dashboardStats.topProducts} />
        </div>
        <div className="lg:col-span-2">
          <RecentOrdersTable orders={orders} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;