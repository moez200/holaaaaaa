import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, CreditCard, BarChart } from 'lucide-react';
import { parseISO, differenceInMinutes } from 'date-fns';
import axios, { AxiosError } from 'axios';
import StatCard from '../ui/StatCard';
import ChartCard from '../ui/ChartCard';
import TableCard from '../ui/TableCard';
import api from '../../axiosInstance';

interface Stat {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: JSX.Element;
}

interface User {
  id: number;
  name: string;
  email: string;
  date: string;
  status: string;
}

interface Order {
  id: number;
  order: string;
  amount: string;
  date: string;
  status: string;
}

interface Revenue {
  month: number;
  total: number;
}

interface Growth {
  week: number;
  count: number;
}

const Overview: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [revenueData, setRevenueData] = useState<Revenue[]>([]);
  const [growthData, setGrowthData] = useState<Growth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsResponse = await api.get('/cart/dashboard-stats/');
        setStats([
          {
            title: 'Total Users',
            value: statsResponse.data.total_users,
            change: '+12.5%', // Static; compute dynamically if needed
            changeType: 'positive',
            icon: <Users className="text-blue-500" />,
          },
          {
            title: 'Active Merchants',
            value: statsResponse.data.active_merchants,
            change: '+3.2%',
            changeType: 'positive',
            icon: <ShoppingBag className="text-emerald-500" />,
          },
          {
            title: 'Total Revenue',
            value: statsResponse.data.total_revenue,
            change: '+5.4%',
            changeType: 'positive',
            icon: <CreditCard className="text-purple-500" />,
          },
          {
            title: 'Tickets Open',
            value: statsResponse.data.tickets_open,
            change: '-12%',
            changeType: 'negative',
            icon: <BarChart className="text-amber-500" />,
          },
        ]);

        // Fetch recent users
        const usersResponse = await api.get('/cart/recent-users/');
        setRecentUsers(
          usersResponse.data.map((user: User) => ({
            ...user,
            date: formatDate(user.date),
          }))
        );

        // Fetch recent orders
        const ordersResponse = await api.get('/cart/recent-orders/');
        setRecentOrders(
          ordersResponse.data.map((order: Order) => ({
            ...order,
            date: formatDate(order.date),
          }))
        );

        // Fetch revenue overview
        const revenueResponse = await api.get('/cart/revenue-overview/');
        setRevenueData(revenueResponse.data);

        // Fetch user growth
        const growthResponse = await api.get('/cart/user-growth/');
        setGrowthData(growthResponse.data);

        setLoading(false);
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Error fetching data:', axiosError.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (isoDate: string): string => {
    try {
      const date = parseISO(isoDate);
      const now = new Date();
      const diffMinutes = differenceInMinutes(now, date);
      if (diffMinutes < 60) return `${diffMinutes} min ago`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
      return `${Math.floor(diffMinutes / 1440)} days ago`;
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Revenue Overview"
            subtitle="Monthly revenue for the current year"
            chartType="bar"
            data={revenueData}
            loading={loading}
          />
        </div>
        <div>
          <ChartCard
            title="User Growth"
            subtitle="New users per week"
            chartType="line"
            data={growthData}
            loading={loading}
          />
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
            { key: 'status', header: 'Status' },
          ]}
        />
        <TableCard
          title="Recent Orders"
          subtitle="Latest transactions"
          data={recentOrders}
          columns={[
            { key: 'order', header: 'Order ID' },
            { key: 'amount', header: 'Amount' },
            { key: 'date', header: 'Date' },
            { key: 'status', header: 'Status' },
          ]}
        />
      </div>
    </div>
  );
};

export default Overview;