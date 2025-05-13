import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle }) => {
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
      
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-400 text-sm">Chart visualization would appear here</p>
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