import React, { useState, useEffect } from 'react';
import BadgeCard from './BadgeCard';
import BadgeForm from './BadgeForm';
import { PlusCircle } from 'lucide-react';
import { Badge } from '../../../types';
import { badgeService, createBadge } from '../../../services/BadgeService';


const BadgeList: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentBadge, setCurrentBadge] = useState<Badge | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // Fetch badges on mount
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const data = await badgeService.getBadges();
        setBadges(data);
      } catch (err) {
        setError('Failed to load badges. Please try again.');
      }
    };
    fetchBadges();
  }, []);

  const handleCreateBadge = () => {
    setCurrentBadge(undefined);
    setIsFormOpen(true);
  };

  const handleEditBadge = (badge: Badge) => {
    setCurrentBadge(badge);
    setIsFormOpen(true);
  };

  const handleDeleteBadge = async (badge: Badge) => {
    try {
      await badgeService.deleteBadge(badge.id);
      setBadges(badges.filter((b) => b.id !== badge.id));
    } catch (err) {
      setError('Failed to delete badge. Please try again.');
    }
  };

  const handleSubmit = async (badgeData: Omit<Badge, 'id'> & { id?: string }) => {
    try {
      if (badgeData.id) {
        const updatedBadge = await badgeService.updateBadge(badgeData.id, badgeData);
        setBadges(badges.map((b) => (b.id === badgeData.id ? updatedBadge : b)));
      } else {
        const { id, ...rest } = badgeData;
        const newBadge = await createBadge(rest);
        console.log('New badge created:', newBadge);
        setBadges([...badges, newBadge]);
      }
      setIsFormOpen(false);
    } catch (err: any) {
      console.error('Submit error:', err.message, err);
      setError('Failed to save badge: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Customer Loyalty Badges</h2>
        <button
          onClick={handleCreateBadge}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <PlusCircle size={18} />
          <span>Add Badge</span>
        </button>
      </div>

      {badges.length === 0 && !error ? (
        <div className="text-center text-gray-500 py-8">
          No badges yet. Click "Add Badge" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {badges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              onEdit={handleEditBadge}
              onDelete={handleDeleteBadge}
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <BadgeForm
          badge={currentBadge}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default BadgeList;