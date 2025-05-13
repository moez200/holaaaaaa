import React from 'react';
import { Category } from '../../types';
import { Edit, Trash2, Package } from 'lucide-react';
import Card from '../ui/Card';

type CategoryCardProps = {
  category: Category;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
};

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category,
  onEdit,
  onDelete
}) => {
  return (
    <Card>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
          <p className="text-gray-500 text-sm mt-1">{category.description}</p>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <Package size={16} className="mr-1" />
            <span>{category.productsCount} products</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit && onEdit(category)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onDelete && onDelete(category)}
            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${Math.min(category.productsCount, 100)}%` }}
          ></div>
        </div>
      </div>
    </Card>
  );
};

export default CategoryCard;