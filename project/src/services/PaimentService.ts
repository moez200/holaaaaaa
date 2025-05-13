

import { AxiosResponse } from 'axios';
import api from '../axiosInstance';

const API_URL = 'http://localhost:8000/config/'; // Ajustez selon votre backend

interface PaymentData {
  id: string;
  order_id: number;
  tranche: number;
  montant: string;
  montant_initial: string;
  date_ordre: string;
  date_echeance: string;
  statut: string;
  statut_display: string;
  type_remise: string;
  type_remise_display: string;
  remise_appliquee: string;
  pourcentage_remise: string;
  montant_apres_remise: string;
  montant_paye?: number;
  duree_plan_paiement: string;
}

interface Totals {
  total_montant_initial: string;
  total_remise: string;
  total_apres_remise: string;
  total_paye: string;
}

interface PaymentResponse {
  payments: PaymentData[];
  totals: Totals;
  order_status: string;
}

const paymentService = {
  /**
   * Récupère les échéances de paiement pour un client et une commande.
   * @param client_id ID du client
   * @param order_id ID de la commande
   * @returns Objet contenant la liste des paiements, les totaux et le statut de la commande
   */
  getPayments: async (client_id: number, order_id: number): Promise<PaymentResponse> => {
    try {
      const response: AxiosResponse<PaymentResponse> = await api.get(
        `${API_URL}clients/${client_id}/orders/${order_id}/payments/`
      );
      console.log('API Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in getPayments:', error);
      let errorMessage = 'Échec de la récupération des échéances de paiement';
      if (error.response) {
        console.error('Error Response:', error.response.data);
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data.error || 'Requête invalide';
            break;
          case 403:
            errorMessage = 'Accès non autorisé';
            break;
          case 404:
            errorMessage = 'Client ou commande non trouvé';
            break;
          default:
            errorMessage = error.response.data.error || 'Erreur serveur';
        }
      } else if (error.request) {
        errorMessage = 'Aucune réponse du serveur';
      }
      throw new Error(errorMessage);
    }
  },

  /**
   * Traite le paiement d'une tranche spécifique.
   * @param client_id ID du client
   * @param order_id ID de la commande
   * @param tranche Numéro de la tranche
   * @returns Données de la tranche mise à jour
   */
  payTranche: async (client_id: number, order_id: number, tranche: number): Promise<PaymentData> => {
    try {
      const response: AxiosResponse<PaymentData> = await api.post(
        `${API_URL}clients/${client_id}/orders/${order_id}/pay-tranche/`,
        { tranche }
      );
      return {
        ...response.data,
        montant_paye: parseFloat(response.data.montant_paye as any) || 0,
      };
    } catch (error: any) {
      console.error('Error in payTranche:', error);
      let errorMessage = 'Échec du traitement du paiement';
      if (error.response) {
        console.error('Error Response:', error.response.data);
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data.error || 'Requête invalide';
            break;
          case 403:
            errorMessage = 'Accès non autorisé';
            break;
          case 404:
            errorMessage = 'Tranche non trouvée';
            break;
          case 409:
            errorMessage = 'La tranche est déjà payée';
            break;
          default:
            errorMessage = error.response.data.error || 'Erreur serveur';
        }
      } else if (error.request) {
        errorMessage = 'Aucune réponse du serveur';
      }
      throw new Error(errorMessage);
    }
  },

  /**
   * Traite le paiement total de la commande.
   * @param client_id ID du client
   * @param order_id ID de la commande
   * @returns Données de la réponse du paiement total
   */
  payTotal: async (client_id: number, order_id: number): Promise<void> => {
    try {
      await api.post(`${API_URL}clients/${client_id}/orders/${order_id}/pay-total/`);
    } catch (error: any) {
      console.error('Error in payTotal:', error);
      let errorMessage = 'Échec du paiement total';
      if (error.response) {
        console.error('Error Response:', error.response.data);
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data.error || 'Requête invalide';
            break;
          case 403:
            errorMessage = 'Accès non autorisé';
            break;
          case 404:
            errorMessage = 'Commande non trouvée';
            break;
          case 409:
            errorMessage = 'La commande est déjà payée';
            break;
          default:
            errorMessage = error.response.data.error || 'Erreur serveur';
        }
      } else if (error.request) {
        errorMessage = 'Aucune réponse du serveur';
      }
      throw new Error(errorMessage);
    }
  },
};

export default paymentService;