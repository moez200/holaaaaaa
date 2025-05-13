import axios from 'axios';
import { CategoryBoutique, LoginResponse, UserLoginData, UserSignupData } from '../types';

import api from '../axiosInstance';

const API_URL = 'http://localhost:8000/users';


export const register = async (userData: UserSignupData) : Promise<{ message: string }>=> {
  console.log('register',userData)
  try {
    const response = await axios.post(`${API_URL}/signup/`, userData);
    console.log('Réponse de l\'API:', response.data); 
    return response.data;
  } catch (error) {
    throw (error as any).response?.data || { message: 'Registration failed' };
  }
  
};

  
export const login = async (userData: UserLoginData): Promise<{ access_token: string; refresh_token: string;user: any }> => {
    try {
      const response = await axios.post(`${API_URL}/login/`, userData);
      return response.data;
    } catch (error) {
      throw (error as any).response?.data || { message: 'Login failed' };
    }
  };
  export const createCategory = async (data: CategoryBoutique): Promise<CategoryBoutique> => {
    try {
      const formData = new FormData();
      formData.append('nom', data.nom);
      if (data.image) {
        formData.append('image', data.image);
      }
      const response = await api.post('/boutique/category_boutiques/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw (error as any).response?.data || { message: 'Failed to create category' };
    }
    
  };
  
  export const updateCategory = async (id: number | undefined, data: CategoryBoutique): Promise<CategoryBoutique> => {
    try {
      const formData = new FormData();
      formData.append('nom', data.nom);
      if (data.image) {
        formData.append('image', data.image);
      }
      const response = await api.put(`/boutique/category_boutiques/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw (error as any).response?.data || { message: 'Failed to update category' };
    }
  };
  
  export const deleteCategory = async (id: number | undefined): Promise<void> => {
    try {
      await api.delete(`/boutique/category_boutiques/${id}/`);
    } catch (error) {
      throw (error as any).response?.data || { message: 'Failed to delete category' };
    }
  };