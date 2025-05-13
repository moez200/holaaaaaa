import React from 'react';
import { Users, ShoppingBag, CreditCard, BarChart } from 'lucide-react';
import StatCard from '../ui/StatCard';
import ChartCard from '../ui/ChartCard';
import TableCard from '../ui/TableCard';

const Overview: React.FC = () => {
  const stats = [
    { 
      title: 'Total Users', 
      value: '24,521', 
      change: '+12.5%', 
      changeType: 'positive',
      icon: <Users className="text-blue-500" />
    },
    { 
      title: 'Active Merchants', 
      value: '1,325', 
      change: '+3.2%', 
      changeType: 'positive',
      icon: <ShoppingBag className="text-emerald-500" />
    },
    { 
      title: 'Total Revenue', 
      value: '$52,429', 
      change: '+5.4%', 
      changeType: 'positive',
      icon: <CreditCard className="text-purple-500" />
    },
    { 
      title: 'Tickets Open', 
      value: '43', 
      change: '-12%', 
      changeType: 'negative',
      icon: <BarChart className="text-amber-500" />
    },
  ];

  const recentUsers = [
    { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', date: '2 min ago', status: 'active' },
    { id: 2, name: 'Michael Brown', email: 'michael@example.com', date: '1 hour ago', status: 'active' },
    { id: 3, name: 'Emma Wilson', email: 'emma@example.com', date: '3 hours ago', status: 'inactive' },
    { id: 4, name: 'James Smith', email: 'james@example.com', date: '5 hours ago', status: 'active' },
    { id: 5, name: 'Olivia Davis', email: 'olivia@example.com', date: '1 day ago', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType as 'positive' | 'negative' | 'neutral'}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="Revenue Overview" subtitle="Monthly revenue for the current year" />
        </div>
        <div>
          <ChartCard title="User Growth" subtitle="New users per week" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TableCard 
          title="Recent Users" 
          subtitle="Newly registered users"
          data={recentUsers}
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'email', header: 'Email' },
            { key: 'date', header: 'Joined' },
            { key: 'status', header: 'Status' }
          ]}
        />
        <TableCard 
          title="Recent Orders" 
          subtitle="Latest transactions"
          data={[
            { id: 1, order: '#ORD-5321', amount: '$124.00', date: '2 min ago', status: 'completed' },
            { id: 2, order: '#ORD-5320', amount: '$75.00', date: '45 min ago', status: 'processing' },
            { id: 3, order: '#ORD-5319', amount: '$246.00', date: '3 hours ago', status: 'completed' },
            { id: 4, order: '#ORD-5318', amount: '$65.50', date: '5 hours ago', status: 'cancelled' },
            { id: 5, order: '#ORD-5317', amount: '$89.25', date: '1 day ago', status: 'completed' },
          ]}
          columns={[
            { key: 'order', header: 'Order ID' },
            { key: 'amount', header: 'Amount' },
            { key: 'date', header: 'Date' },
            { key: 'status', header: 'Status' }
          ]}
        />
      </div>
    </div>
  );
};

export default Overview;