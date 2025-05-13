// src/components/Store/cartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import api from '../../axiosInstance';
import { LignePanier, Panier } from '../../types';

interface CartState {
  panier: Panier | null;
  totalItems: number;
  isLoading: boolean;
  error: string | null;
  fetchCart: (clientId: number) => Promise<void>;
  addToCart: (produitId: number, quantite?: number) => Promise<void>;
  removeFromCart: (lignePanierId: number) => Promise<void>;
  updateQuantity: (lignePanierId: number, quantite: number) => Promise<void>;
  clearCart: () => void;
  resetForVisitor: () => void; // New
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      panier: null,
      totalItems: 0,
      isLoading: false,
      error: null,
      fetchCart: async (clientId: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/cart/paniers/${clientId}`);
          const panier = response.data;
          const totalItems = panier.lignes?.reduce(
            (sum: number, ligne: LignePanier) => sum + ligne.quantite,
            0
          ) || 0;
          set({ panier, totalItems, isLoading: false });
        } catch (error: any) {
          console.error('Fetch cart error:', error);
          set({
            error: error.response?.data?.error || 'Erreur lors de la récupération du panier',
            isLoading: false,
          });
        }
      },
      addToCart: async (produitId: number, quantite: number = 1) => {
        const authState = useAuthStore.getState();
        if (!authState.isAuthenticated || !authState.user?.id) {
          set({ error: 'Veuillez vous connecter pour ajouter des produits au panier.' });
          return;
        }
        set({ isLoading: true, error: null });
        try {
          const clientId = authState.user.id;
          const response = await api.post('/cart/paniers/add/', {
            client_id: clientId,
            produit_id: produitId,
            quantite,
          });
          const panier = response.data.panier;
          const totalItems = panier.lignes?.reduce(
            (sum: number, ligne: LignePanier) => sum + ligne.quantite,
            0
          ) || 0;
          set({ panier, totalItems, isLoading: false });
        } catch (error: any) {
          console.error('Add to cart error:', error);
          set({
            error: error.response?.data?.error || 'Erreur lors de l’ajout au panier',
            isLoading: false,
          });
        }
      },
      removeFromCart: async (lignePanierId: number) => {
        set({ isLoading: true, error: null });
        try {
          await api.delete(`/cart/panier/ligne/${lignePanierId}/delete/`);
          const currentPanier = get().panier;
          if (currentPanier) {
            const updatedLignes = currentPanier.lignes.filter(
              (ligne: LignePanier) => ligne.id !== lignePanierId
            );
            const totalItems = updatedLignes.reduce(
              (sum: number, ligne: LignePanier) => sum + ligne.quantite,
              0
            );
            set({
              panier: { ...currentPanier, lignes: updatedLignes },
              totalItems,
              isLoading: false,
            });
          }
        } catch (error: any) {
          console.error('Remove from cart error:', error);
          set({
            error: error.response?.data?.error || 'Erreur lors de la suppression',
            isLoading: false,
          });
        }
      },
      updateQuantity: async (lignePanierId: number, quantite: number) => {
        set({ isLoading: true, error: null });
        try {
          await api.put(`/cart/paniers/ligne/${lignePanierId}/`, { quantite });
          const currentPanier = get().panier;
          if (currentPanier) {
            const updatedLignes = currentPanier.lignes.map((ligne: LignePanier) =>
              ligne.id === lignePanierId ? { ...ligne, quantite } : ligne
            );
            const totalItems = updatedLignes.reduce(
              (sum: number, ligne: LignePanier) => sum + ligne.quantite,
              0
            );
            set({
              panier: { ...currentPanier, lignes: updatedLignes },
              totalItems,
              isLoading: false,
            });
          }
        } catch (error: any) {
          console.error('Update quantity error:', error);
          set({
            error: error.response?.data?.error || 'Erreur lors de la mise à jour de la quantité',
            isLoading: false,
          });
        }
      },
      clearCart: () => {
        set({ panier: null, totalItems: 0, error: null, isLoading: false });
      },
      resetForVisitor: () => {
        set({ panier: null, totalItems: 0, error: null, isLoading: false });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        panier: state.panier,
        totalItems: state.totalItems,
      }),
    }
  )
);