import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Badge } from '../../../types';

interface BadgeFormProps {
  badge?: Badge;
  onSubmit: (badge: Omit<Badge, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

const initialState: Omit<Badge, 'id'> = {
  name: '',
  threshold: 0,
  discount: 0,
  icon: 'award',
  color: 'bg-amber-600'
};

const colorOptions = [
  { value: 'bg-amber-400', label: 'Bronze' },
  { value: 'bg-slate-400', label: 'Silver' },
  { value: 'bg-yellow-400', label: 'Gold' },
  { value: 'bg-indigo-400', label: 'Indigo' },
  { value: 'bg-purple-400', label: 'Purple' },
  { value: 'bg-cyan-400', label: 'Cyan' },
  { value: 'bg-emerald-400', label: 'Emerald' },
  { value: 'bg-rose-400', label: 'Rose' },
];

const BadgeForm: React.FC<BadgeFormProps> = ({ badge, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Badge, 'id'> & { id?: string }>(
    badge || initialState
  );

  useEffect(() => {
    if (badge) {
      setFormData(badge);
    } else {
      setFormData(initialState);
    }
  }, [badge]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'threshold' || name === 'discount' ? parseInt(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 relative animate-fade-in-up">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all duration-200"
        >
          <X size={18} />
        </button>
        
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          {badge ? 'Edit Badge' : 'Create New Badge'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Badge Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200"
                placeholder="e.g. Gold"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orders Threshold
              </label>
              <input
                type="number"
                name="threshold"
                value={formData.threshold}
                onChange={handleChange}
                min={1}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200"
                placeholder="Minimum orders required"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min={0}
                max={100}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200"
                placeholder="Discount percentage"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Badge Color
              </label>
              <div className="grid grid-cols-4 gap-3 mt-2">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`w-full aspect-square rounded-full ${color.value} border-2 ${
                      formData.color === color.value 
                        ? 'border-purple-400 scale-110 shadow-md' 
                        : 'border-transparent'
                    } transition-all duration-200 hover:scale-105`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-400 to-indigo-400 text-white rounded-lg font-medium hover:from-purple-500 hover:to-indigo-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {badge ? 'Update Badge' : 'Create Badge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BadgeForm;