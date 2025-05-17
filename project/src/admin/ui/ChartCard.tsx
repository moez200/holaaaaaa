import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface ChartCardProps {
  title: string;
  subtitle: string;
  chartType: 'bar' | 'line';
  data: any[];
  loading?: boolean;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, chartType, data, loading }) => {
  const chartData = chartType === 'bar' ? {
    labels: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    datasets: [
      {
        label: 'Revenue ($)',
        data: data.map((item) => item.total),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  } : {
    labels: data.map((item) => `Week ${item.week}`),
    datasets: [
      {
        label: 'New Users',
        data: data.map((item) => item.count),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <button className="p-1 rounded-full hover:bg-gray-100">
          <MoreHorizontal size={20} className="text-gray-400" />
        </button>
      </div>

      <div className="h-64">
        {loading ? (
          <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        ) : (
          chartType === 'bar' ? (
            <Bar data={chartData} options={options} />
          ) : (
            <Line data={chartData} options={options} />
          )
        )}
      </div>

      <div className="mt-4 flex justify-between text-sm">
        <div className="text-gray-500">
          <span className="font-medium text-gray-900">15%</span> more than last month
        </div>
        <button className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
};

export default ChartCard;