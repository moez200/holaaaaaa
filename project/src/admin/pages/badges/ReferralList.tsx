import React, { useState, useEffect } from 'react';
import ReferralForm from './ReferralForm';
import { PlusCircle } from 'lucide-react';
import { ReferralRule } from '../../../types';
import ReferralRuleCard from './ReferralRuleCard';
import { referralService } from '../../../services/ReffralService';


const ReferralList: React.FC = () => {
  const [referralRules, setReferralRules] = useState<ReferralRule[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState<ReferralRule | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // Fetch referral rules on mount
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const data = await referralService.getReferralRules();
        setReferralRules(data);
      } catch (err) {
        setError('Failed to load referral rules. Please try again.');
      }
    };
    fetchRules();
  }, []);

  const handleCreateRule = () => {
    setCurrentRule(undefined);
    setIsFormOpen(true);
  };

  const handleEditRule = (rule: ReferralRule) => {
    setCurrentRule(rule);
    setIsFormOpen(true);
  };

  const handleDeleteRule = async (rule: ReferralRule) => {
    try {
      await referralService.deleteReferralRule(rule.id);
      setReferralRules(referralRules.filter((r) => r.id !== rule.id));
    } catch (err) {
      setError('Failed to delete referral rule. Please try again.');
    }
  };

  const handleSubmit = async (ruleData: Omit<ReferralRule, 'id'> & { id?: string }) => {
    try {
      if (ruleData.id) {
        // Update existing rule
        const updatedRule = await referralService.updateReferralRule(ruleData.id, ruleData);
        setReferralRules(referralRules.map((r) => (r.id === ruleData.id ? updatedRule : r)));
      } else {
        // Create new rule
        const newRule = await referralService.createReferralRule(ruleData);
        setReferralRules([...referralRules, newRule]);
      }
      setIsFormOpen(false);
    } catch (err) {
      setError('Failed to save referral rule. Please try again.');
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Referral Reward Rules
        </h2>
        <button
          onClick={handleCreateRule}
          className="px-4 py-2 bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <PlusCircle size={18} />
          <span>Add Rule</span>
        </button>
      </div>

      {referralRules.length === 0 && !error ? (
        <div className="text-center text-gray-500 py-8">
          No referral rules yet. Click "Add Rule" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {referralRules.map((rule) => (
            <ReferralRuleCard
              key={rule.id}
              rule={rule}
              onEdit={handleEditRule}
              onDelete={handleDeleteRule}
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <ReferralForm
          rule={currentRule}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default ReferralList;