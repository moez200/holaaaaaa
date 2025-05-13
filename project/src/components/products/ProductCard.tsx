import React from 'react';
import { Product } from '../../types';
import { Edit, Trash2 } from 'lucide-react';
import Badge from '../ui/Badge';

type ProductCardProps = {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
};

const ProductCard: React.FC<ProductCardProps> = ({ 
  product,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 transition-all hover:shadow-md group">
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover object-center transition-transform group-hover:scale-105"
        />
        {product.featured && (
          <div className="absolute top-2 left-2">
            <Badge variant="info">Featured</Badge>
          </div>
        )}
        {product.stock <= 5 && (
          <div className="absolute top-2 right-2">
            <Badge variant="danger">Low Stock</Badge>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-1">
          <Badge variant="default">{product.category}</Badge>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">${product.price.toFixed(2)}</span>
          <span className="text-sm text-gray-600">{product.stock} in stock</span>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between">
        <button 
          onClick={() => onEdit && onEdit(product)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
        >
          <Edit size={16} className="mr-1" />
          Edit
        </button>
        <button 
          onClick={() => onDelete && onDelete(product)}
          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
        >
          <Trash2 size={16} className="mr-1" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default ProductCard;