import React from 'react';
import { DollarSign, Package, ShoppingCart, Truck } from 'lucide-react';
import { Box, CircularProgress, Typography } from '@mui/material';
import ChartCard from './ui/ChartCard';
import ProductTable from './ui/ProductTable';
import StatCard from './ui/StatCard';
import { Produit } from '../types';


interface DashboardData {
  overview: {
    total_sales: number | string;
    total_orders: number;
    total_products: number;
    active_customers: number;
  } | null;
  monthlySales: { month: string; sales: number }[];
  productsByCategory: { category: string; product_count: number }[];
  topSellingProducts: Produit[];
  outOfStockProducts: number;
}

interface OverviewProps {
  dashboardData: DashboardData;
}

const Overview: React.FC<OverviewProps> = ({ dashboardData }) => {
  // Handle loading state
  if (!dashboardData.overview) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
console.log('dashboardData',dashboardData)
  // Extract statistics
  const totalProducts = dashboardData.overview.total_products;
  const totalOrders = dashboardData.overview.total_orders;
  const totalRevenue = typeof dashboardData.overview.total_sales === 'string'
    ? parseFloat(dashboardData.overview.total_sales)
    : dashboardData.overview.total_sales;
  const outOfStockProducts = dashboardData.outOfStockProducts;

  // Map monthly sales data
  const monthlyData = dashboardData.monthlySales.map((sale) => ({
    name: sale.month,
    value: sale.sales,
  }));

  // Map products by category
  const categoryData = dashboardData.productsByCategory.map((category) => ({
    name: category.category,
    value: category.product_count,
  }));

  // Top 5 products (already sorted by backend)
  const topProducts = dashboardData.topSellingProducts.map((product) => ({
    id: product.id,
    nom: product.nom,
    category_name: product.category_name,
    prix: product.prix,
    stock: product.stock,
    total_sold: product.total_sold,
    image: product.image,
  }));
console.log('topProducts',topProducts)
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
          data={monthlyData.slice(-6)} // Show last 6 months
        />
        <ChartCard 
          title="Produits par Catégorie"
          subtitle="Répartition actuelle"
          type="pie"
          data={categoryData}
        />
      </div>

      {/* Top Products */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Produits les Plus Vendus</h2>
        <ProductTable products={topProducts} />
      </div>
    </div>
  );
};

export default Overview;