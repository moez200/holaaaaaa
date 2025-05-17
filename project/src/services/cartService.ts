import axios from 'axios';
import { LignePanier,  OrderCreatePayload, Panier } from '../types';
import { useAuthStore } from '../components/Store/authStore';
import api from '../axiosInstance';

const API_URL = 'http://localhost:8000/';

export const addToCart = async (clientId: number, produitId: number, quantite: number = 1): Promise<{ ligne_panier: LignePanier; panier: Panier }> => {
  try {
    const response = await api.post(
      `${API_URL}cart/paniers/add/`,
      { produit_id: produitId, quantite, client_id: clientId },
    
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Erreur lors de l\'ajout au panier');
  }
};

export const getCart = async (clientId: number): Promise<Panier> => {
  try {
    const response = await axios.get(`${API_URL}cart/paniers/${clientId}/`, {
      headers: {
        Authorization: `Bearer ${useAuthStore.getState().access_token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la récupération du panier');
  }
};

export const removeFromCart = async (lignePanierId: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}cart/panier/lignes/${lignePanierId}/delete/`, {
      headers: {
        Authorization: `Bearer ${useAuthStore.getState().access_token}`,
      },
    });
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la suppression du produit');
  }
};

export const updateCartQuantity = async (lignePanierId: number, quantite: number): Promise<LignePanier> => {
  try {
    const response = await axios.patch(
      `${API_URL}cart/panier/lignes/${lignePanierId}/`,
      { quantite },
      {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().access_token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la mise à jour de la quantité');
  }
};
export const placeOrder = async (order: OrderCreatePayload): Promise<OrderCreatePayload> => {
  try {
    const response = await api.post(
      `cart/panier/checkout/`,
      order,
   
    );
    return response.data;
    console.log('order respponse',response.data)
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la création de la commande');
  }
};