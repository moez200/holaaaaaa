// src/components/Store/wishlistStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { Product } from '../../types';
import api from '../../axiosInstance';

interface WishlistState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
  fetchWishlist: (clientId: number) => Promise<void>;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      fetchWishlist: async (clientId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`boutique/wishlist/${clientId}`);
          const items = response.data.items.map((item: any) => ({
            id: item.produit.id,
            name: item.produit.nom,
            description: item.produit.description,
            price: parseFloat(item.produit.prix),
            discountedPrice: item.produit.prix_reduit ? parseFloat(item.produit.prix_reduit) : undefined,
            stock: item.produit.stock,
            images: item.produit.image ? [item.produit.image] : ['https://via.placeholder.com/300'],
            couleur: item.produit.couleur,
            taille: item.produit.taille,
            category: item.produit.category_produit_details?.nom || 'Unknown',
            vendor: {
              id: item.produit.boutique,
              name: item.produit.boutique_details?.nom || 'Inconnu',
            },
            rating: item.produit.note || 0,
            inStock: item.produit.en_stock,
            isNew: item.produit.est_nouveau,
            isFeatured: item.produit.est_mis_en_avant,
          }));
          set({ items, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Erreur lors de la récupération de la liste',
            isLoading: false,
          });
        }
      },
      addToWishlist: async (product) => {
        const authState = useAuthStore.getState();
        if (!authState.isAuthenticated || !authState.user?.id) {
          set({ error: 'Veuillez vous connecter pour ajouter à la liste de souhaits.' });
          return;
        }
        set({ isLoading: true, error: null });
        try {
          await api.post('boutique/wishlist/add/', {
            clientId: authState.user.id,
            produitId: product.id,
          });
          set((state) => ({
            items: state.items.some((item) => item.id === product.id)
              ? state.items // Éviter les doublons
              : [...state.items, product],
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Erreur lors de l’ajout',
            isLoading: false,
          });
        }
      },
      removeFromWishlist: async (productId) => {
        set({ isLoading: true, error: null });
        try {
          await api.delete(`boutique/wishlist/remove/${productId}/`);
          set((state) => ({
            items: state.items.filter((item) => item.id !== productId),
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Erreur lors de la suppression',
            isLoading: false,
          });
        }
      },
      isInWishlist: (productId) => get().items.some((item) => item.id === productId),
      clearWishlist: async () => {
        set({ isLoading: true, error: null });
        try {
          await api.delete('boutique/wishlist/clear/');
          set({ items: [], isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Erreur lors du vidage',
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);