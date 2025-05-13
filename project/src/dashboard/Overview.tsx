import React from 'react';
import { DollarSign, Package, ShoppingCart, Truck } from 'lucide-react';
import { mockProducts, mockOrders } from './data/mockData';
import ChartCard from './ui/ChartCard';
import ProductTable from './ui/ProductTable';
import StatCard from './ui/StatCard';


const Overview: React.FC = () => {
  // Calculate statistics
  const totalProducts = mockProducts.length;
  const totalOrders = mockOrders.length;
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0);
  const outOfStockProducts = mockProducts.filter(product => product.stock === 0).length;
  
  // Get 5 best-selling products for the table
  const topProducts = [...mockProducts]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  // Monthly sales data for chart (last 6 months)
  const monthlyData = [
    { name: 'Jan', value: 12500 },
    { name: 'Fév', value: 18200 },
    { name: 'Mar', value: 16900 },
    { name: 'Avr', value: 21500 },
    { name: 'Mai', value: 25800 },
    { name: 'Juin', value: 23100 },
  ];

  // Products by category for pie chart
  const categoryData = [
    { name: 'Fashion', value: 35 },
    { name: 'Beauty', value: 20 },
    { name: 'Electronics', value: 15 },
    { name: 'Home', value: 30 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Vue d'ensemble</h1>
        <p className="text-gray-500">Bienvenue sur votre tableau de bord marchand</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Produits Publiés"
          value={totalProducts}
          icon={<Package className="text-blue-600" />}
          trend="+5%"
          trendUp={true}
        />
        <StatCard 
          title="Commandes Reçues"
          value={totalOrders}
          icon={<ShoppingCart className="text-green-600" />}
          trend="+12%"
          trendUp={true}
        />
        <StatCard 
          title="Chiffre d'Affaires"
          value={`${totalRevenue.toLocaleString()} €`}
          icon={<DollarSign className="text-purple-600" />}
          trend="+8%"
          trendUp={true}
        />
        <StatCard 
          title="Produits en Rupture"
          value={outOfStockProducts}
          icon={<Truck className="text-red-600" />}
          trend="+2"
          trendUp={false}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Ventes Mensuelles"
          subtitle="6 derniers mois"
          type="bar"
          data={monthlyData}
        />
        <ChartCard 
          title="Produits par Catégorie"
          subtitle="Répartition actuelle"
          type="pie"
          data={categoryData}
        />
      </div>

      {/* Recent Orders & Top Products */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Produits les Plus Vendus</h2>
        <ProductTable products={topProducts} />
      </div>
    </div>
  );
};

export default Overview;