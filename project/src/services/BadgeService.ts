// src/services/badgeService.ts

import api from '../axiosInstance';
import { Badge } from '../types';

export const badgeService = {
  // Fetch all badges
  getBadges: async (): Promise<Badge[]> => {
    try {
      const response = await api.get<Badge[]>('config/badges/');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch badges');
    }
  },

  // Fetch a single badge by ID
  getBadge: async (id: string): Promise<Badge> => {
    try {
      const response = await api.get<Badge>(`config/badges/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch badge');
    }
  },



  // Update an existing badge
  updateBadge: async (id: string, badge: Partial<Badge>): Promise<Badge> => {
    try {
      const response = await api.put<Badge>(`config/badges/${id}/`,{
        ...badge,
        color: (badge.color ?? '').startsWith('bg-') ? '#CD7F32' : badge.color ?? '', // Convert Tailwind to hex
        discount: parseFloat((badge.discount ?? 0).toString()), // Ensure float
      } );
      return response.data;
    } catch (error) {
      throw new Error('Failed to update badge');
    }
  },

  // Delete a badge
  deleteBadge: async (id: string): Promise<void> => {
    try {
      await api.delete(`config/badges/${id}/`);
    } catch (error) {
      throw new Error('Failed to delete badge');
    }
  },
};

export const createBadge = async (badge: Badge): Promise<Badge> => {
    console.log('fffff',badge)
    try {
      const response = await api.post('/config/badges/', {
        ...badge,
        color: badge.color.startsWith('bg-') ? '#CD7F32' : badge.color, // Convert Tailwind to hex
        discount: parseFloat(badge.discount.toString()), // Ensure float
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating badge:', error.response?.data || error.message);
      throw error;
    }
  };