import axios, { AxiosResponse } from 'axios';
import { User,  Vendor } from '../types';
import api from '../axiosInstance';



export class UserService {
  // Récupérer tous les utilisateurs
  static async getUsers(): Promise<User[]> {
    try {
      console.log('Fetching users from /users/list/');
      const response = await api.get<User[]>('/users/list/');
      console.log('Users fetched:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des utilisateurs:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      if (error.response?.status === 403) {
        throw new Error('Accès refusé : seuls les administrateurs peuvent lister les utilisateurs.');
      }
      throw error;
    }
  };
  

  // Récupérer un utilisateur par ID
  static async getUserById(id: number): Promise<User> {
    try {
      const response: AxiosResponse<User> = await api.get(`/users/list/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
      throw error;
    }
  }

  // Créer un nouvel utilisateur
  static async createUser(userData: Partial<User>): Promise<User> {
    try {
      const response: AxiosResponse<User> = await api.post(`/users/list/`, userData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }

  // Mettre à jour un utilisateur
  static async updateUser(id: number, userData: Partial<User>): Promise<User> {
    try {
      const response: AxiosResponse<User> = await api.put(`/users/updat/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
      throw error;
    }
  }

  // Supprimer un utilisateur
  static async deleteUser(id: number): Promise<void> {
    try {
      await api.delete(`/users/delete/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
      throw error;
    }
  }

  // Approuver un utilisateur
  static async approveUser(id: number): Promise<User> {
    try {
      const response: AxiosResponse<User> = await api.post(`/users/approve/${id}`, {
        is_approved: true,
      });
     
      return response.data as User;
    } catch (error) {
      console.error(`Erreur lors de l'approbation de l'utilisateur ${id}:`, error);
      throw error;
    }
  }

  // Rejeter un utilisateur
  static async rejectUser(id: number): Promise<User> {
    try {
      const response: AxiosResponse<User> = await api.post(`/users/refuse/${id}`, {
        is_approved: false,
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du rejet de l'utilisateur ${id}:`, error);
      throw error;
    }
  }
}


export const getTopMarchand = async (): Promise<Vendor> => {
  try {
    const response = await axios.get('http://localhost:8000/users/top-marchand/');
    const vendor = response.data;
    return {
      id: vendor.id,
      name: vendor.name, // Nom du marchand
      logo: vendor.logo || 'https://via.placeholder.com/150',
      description: vendor.description || '',
      rating: vendor.average_rating || 0,
      productsCount: vendor.products_count || 0,
      est_nouveau: vendor.est_nouveau || false,
    };
  } catch (error) {
    console.error('Error fetching top marchand:', error);
    throw error;
  }
};