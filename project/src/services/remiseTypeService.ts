import api from '../axiosInstance';
import { RemiseType, RemiseTypeCreatePayload } from '../types';

export const getRemiseTypes = async (boutiqueId: string): Promise<RemiseType[]> => {
  try {
    const response = await api.get<RemiseType[]>('config/admin/remises-types/', {
      params: { boutique_id: boutiqueId },
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.error('Error fetching remise types:', error.response?.data || error.message);
    return [];
  }
};

export const createRemiseType = async (payload: RemiseTypeCreatePayload): Promise<RemiseType> => {
  try {
    const response = await api.post<RemiseType>('config/admin/remises-types/', payload);
    return response.data;
  } catch (error: any) {
    console.error('Error creating remise type:', error.response?.data || error.message);
    throw error;
  }
};

export const updateRemiseType = async (id: number, payload: RemiseTypeCreatePayload): Promise<RemiseType> => {
  console.log('Updating remise type with:', { id, payload });
  try {
    const response = await api.put<RemiseType>(`config/admin/remises-types/${id}/`, payload);
    console.log('Update response:', response.data);
    return response.data;
  } catch (error: any) {
    const errorData = error.response?.data || { error: error.message };
    console.error('Error updating remise type:', errorData);
    throw new Error(errorData.non_field_errors?.[0] || errorData.error || 'Failed to update remise type');
  }
};

export const deleteRemiseType = async (id: number, boutiqueId: string): Promise<void> => {
  console.log('Deleting remise type with id:', id, 'boutiqueId:', boutiqueId);
  try {
    await api.delete(`config/admin/remises-types/${id}/`, {
      params: { boutique_id: boutiqueId },
    });
    console.log('Delete successful');
  } catch (error: any) {
    const errorData = error.response?.data || { error: error.message };
    console.error('Error deleting remise type:', errorData);
    throw new Error(errorData.error || 'Failed to delete remise type');
  }
};