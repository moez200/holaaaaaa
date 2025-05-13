import React from 'react';

import { Award, Edit, Trash2 } from 'lucide-react';

interface BadgeType {
  id: string;
  name: string;
  color: string;
  threshold: number;
  discount: number;
}

interface BadgeCardProps {
  badge: BadgeType;
  onEdit: (badge: BadgeType) => void;
  onDelete: (badge: BadgeType) => void;
}


const BadgeCard: React.FC<BadgeCardProps> = ({ badge, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
      <div className={`h-3 w-full ${badge.color}`}></div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${badge.color} bg-opacity-20 flex items-center justify-center shadow-sm`}>
              <Award size={20} className="text-gray-800" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">{badge.name}</h3>
              <p className="text-gray-500 text-sm">
                {badge.threshold} orders required
              </p>
            </div>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button 
              onClick={() => onEdit(badge)}
              className="p-1.5 rounded-full bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200"
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={() => onDelete(badge)}
              className="p-1.5 rounded-full bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-1.5 rounded-full text-sm font-medium text-purple-600">
            {badge.discount}% Discount
          </div>
          
          <div className="text-sm text-gray-500">
            Priority {parseInt(badge.id)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeCard;