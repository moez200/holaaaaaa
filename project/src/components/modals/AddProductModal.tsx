import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { X } from 'lucide-react';
import { Category } from '../../types';

type AddProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    featured: boolean;
    image: string;
  }) => void;
  categories: Category[];
};

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [featured, setFeatured] = useState(false);
  const [image, setImage] = useState('https://images.pexels.com/photos/3394665/pexels-photo-3394665.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      price: parseFloat(price) || 0,
      stock: parseInt(stock) || 0,
      category,
      featured,
      image
    });
    
    // Reset form
    setName('');
    setDescription('');
    setPrice('');
    setStock('');
    setCategory('');
    setFeatured(false);
    setImage('https://images.pexels.com/photos/3394665/pexels-photo-3394665.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 p-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-medium text-gray-900">Add New Product</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  id="product-name"
                  label="Product Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  fullWidth
                  placeholder="Enter product name"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="product-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter product description"
                ></textarea>
              </div>
              <div>
                <Input
                  id="product-price"
                  label="Price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  fullWidth
                  placeholder="0.00"
                />
              </div>
              <div>
                <Input
                  id="product-stock"
                  label="Stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  fullWidth
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="product-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Input
                  id="product-image"
                  label="Image URL"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  fullWidth
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex items-center h-10 mt-6">
                <input
                  id="product-featured"
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="product-featured" className="ml-2 block text-sm text-gray-900">
                  Featured product
                </label>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 flex justify-end space-x-3 rounded-b-lg border-t border-gray-200 sticky bottom-0">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || !price || !stock || !category}
            >
              Save Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;