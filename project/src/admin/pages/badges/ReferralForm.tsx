import React, { useState, useEffect } from 'react';

import { X } from 'lucide-react';
import { ReferralRule } from '../../../types';

interface ReferralFormProps {
  rule?: ReferralRule;
  onSubmit: (rule: Omit<ReferralRule, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

const initialState: Omit<ReferralRule, 'id'> = {
  referralsCount: 1,
  discount: 5,
  timeFrame: '1 year',
};

const timeFrameOptions = [
  '1 month',
  '3 months',
  '6 months',
  '1 year',
  '2 years',
  'Lifetime',
];

const ReferralForm: React.FC<ReferralFormProps> = ({ rule, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Omit<ReferralRule, 'id'> & { id?: string }>(
    rule || initialState
  );

  useEffect(() => {
    if (rule) {
      setFormData(rule);
    } else {
      setFormData(initialState);
    }
  }, [rule]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'referralsCount' || name === 'discount' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 relative animate-fade-in-up">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all duration-200"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-6">
          {rule ? 'Edit Referral Rule' : 'Create New Referral Rule'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Referrals
              </label>
              <input
                type="number"
                name="referralsCount"
                value={formData.referralsCount}
                onChange={handleChange}
                min={1}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200"
                placeholder="Minimum referrals required"
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
                Time Frame
              </label>
              <select
                name="timeFrame"
                value={formData.timeFrame}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200"
                required
              >
                {timeFrameOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
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
              {rule ? 'Update Rule' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReferralForm;