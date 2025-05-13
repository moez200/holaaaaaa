
import api from '../axiosInstance';
import { Customer } from '../types';

export const customerService = {
  // Fetch all customers
getCustomers: async () => {
    const response = await api.get('/config/clients/');
    return response.data.map((customer: {
      appliedDiscounts: any; id: any; nom: any; email: any; orders: any; referrals: any; current_badge: any; 
}) => ({
      id: customer.id,
      nom: customer.nom,
      email: customer.email,
      orders: customer.orders,
      referrals: customer.referrals,
      currentBadge: customer.current_badge,
      appliedDiscounts: customer.appliedDiscounts, // Map snake_case to camelCase
    }));
  },

  // Fetch a single customer by ID
  getCustomer: async (id: string): Promise<Customer> => {
    try {
      const response = await api.get<Customer>(`config/clients/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch customer');
    }
  },
};