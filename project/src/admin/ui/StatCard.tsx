import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-semibold mt-1 text-gray-900">{value}</h3>
        </div>
        <div className="p-2 rounded-lg bg-gray-50">{icon}</div>
      </div>
      
      <div className="mt-4 flex items-center">
        {changeType === 'positive' && (
          <div className="flex items-center text-emerald-600">
            <ArrowUp size={16} />
            <span className="ml-1 text-sm font-medium">{change}</span>
          </div>
        )}
        
        {changeType === 'negative' && (
          <div className="flex items-center text-red-600">
            <ArrowDown size={16} />
            <span className="ml-1 text-sm font-medium">{change}</span>
          </div>
        )}
        
        {changeType === 'neutral' && (
          <span className="text-sm font-medium text-gray-500">{change}</span>
        )}
        
        <span className="text-xs text-gray-500 ml-2">from last month</span>
      </div>
    </div>
  );
};

export default StatCard;