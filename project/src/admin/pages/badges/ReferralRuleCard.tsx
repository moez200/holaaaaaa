import React from 'react';

import { Gift, Edit, Trash2, Clock } from 'lucide-react';
import { ReferralRule } from '../../../types';

interface ReferralRuleCardProps {
  rule: ReferralRule;
  onEdit: (rule: ReferralRule) => void;
  onDelete: (rule: ReferralRule) => void;
}

const ReferralRuleCard: React.FC<ReferralRuleCardProps> = ({ rule, onEdit, onDelete }) => {
  const gradientClasses = [
    'from-emerald-400 to-teal-400',
    'from-blue-400 to-indigo-400',
    'from-amber-400 to-orange-400',
    'from-rose-400 to-pink-400',
    'from-fuchsia-400 to-purple-400'
  ];
  
  const gradientClass = gradientClasses[parseInt(rule.id) % gradientClasses.length];
  
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 group">
      <div className={`h-3 w-full bg-gradient-to-r ${gradientClass}`}></div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${gradientClass} flex items-center justify-center shadow-sm`}>
              <Gift size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">
                {rule.referrals_count} {rule.referrals_count === 1 ? 'Referral' : 'Referrals'}
              </h3>
              <p className="text-gray-500 text-sm flex items-center gap-1">
                <Clock size={14} />
                <span>Within {rule.time_frame}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button 
              onClick={() => onEdit(rule)}
              className="p-1.5 rounded-full bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-purple-500 transition-all duration-200"
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={() => onDelete(rule)}
              className="p-1.5 rounded-full bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className={`bg-gradient-to-r from-${gradientClass.split(' ')[0].replace('from-', '')}-50 to-${gradientClass.split(' ')[1].replace('to-', '')}-50 px-3 py-1.5 rounded-full text-sm font-medium text-${gradientClass.split(' ')[0].replace('from-', '')}-600`}>
            {rule.discount}% Discount
          </div>
          
          <div className="text-sm text-gray-500">
            Priority {parseInt(rule.id)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralRuleCard;