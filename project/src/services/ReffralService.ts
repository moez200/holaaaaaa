// src/services/referralService.ts

import api from '../axiosInstance';
import { ReferralRule } from '../types';

export const referralService = {
  // Fetch all referral rules
  getReferralRules: async (): Promise<ReferralRule[]> => {
    try {
      const response = await api.get<ReferralRule[]>('config/referral-rules/');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch referral rules');
    }
  },

  // Fetch a single referral rule by ID
  getReferralRule: async (id: string): Promise<ReferralRule> => {
    try {
      const response = await api.get<ReferralRule>(`config/referral-rules/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch referral rule');
    }
  },

  // Create a new referral rule
  createReferralRule: async (rule: Omit<ReferralRule, 'id'>): Promise<ReferralRule> => {
    console.log('$$$$$',rule)
       try {
      const response = await api.post<ReferralRule>('config/referral-rules/', rule);
      return response.data;
      console.log('yyyyyy',response.data)
    } catch (error) {
      throw new Error('Failed to create referral rule');
    }
  },

  // Update an existing referral rule
  updateReferralRule: async (id: string, rule: Partial<ReferralRule>): Promise<ReferralRule> => {
    try {
      const response = await api.put<ReferralRule>(`config/referral-rules/${id}/`, rule);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update referral rule');
    }
  },

  // Delete a referral rule
  deleteReferralRule: async (id: string): Promise<void> => {
    try {
      await api.delete(`config/referral-rules/${id}/`);
    } catch (error) {
      throw new Error('Failed to delete referral rule');
    }
  },
};