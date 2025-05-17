

import axios from 'axios';
import api from '../axiosInstance';
import { CategoryProduit,  Boutique, ProduitCreatePayload, BoutiqueUpdatePayload, Product } from '../types';

export const getCategoryProduits = async (boutiqueId?: string): Promise<CategoryProduit[]> => {
  const response = await api.get<CategoryProduit[]>('boutique/category-produits/', {
    params: { boutique_id: boutiqueId },
  });
  console.log('getCategoryProduits response:', response.data);
  return response.data;
};

export const getProduits = async (categoryId?: string, boutiqueId?: string): Promise<Product[]> => {
  const response = await api.get<Product[]>('boutique/Produits/', {
    params: { category_produit: categoryId, boutique: boutiqueId },
  });
  console.log('getProduits response:', response.data);
  return response.data;
};
export const createProduit = async (payload: ProduitCreatePayload): Promise<Product> => {
  const formData = new FormData();
  formData.append('nom', payload.nom);
  formData.append('description', payload.description);
  formData.append('prix', payload.prix);
  formData.append('stock', payload.stock);
  formData.append('couleur', payload.couleur);
  formData.append('taille', payload.taille);
  formData.append('boutique', payload.boutique);
  formData.append('category_produit', payload.category_produit);

  if (payload.image) {
    formData.append('image_file', payload.image); // Important : ajouter le fichier
  }

  for (const [key, value] of formData.entries()) {
    console.log(`🧾 ${key}:`, value);
  }
  const response = await api.post<Product>('boutique/produits/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data;
};


export const updateProduit = async (id: number, payload: any): Promise<Product> => {
  const response = await api.put<Product>(`boutique/produits/${id}/`, payload);
  return response.data;
};

export const deleteProduit = async (id: number): Promise<void> => {
  await api.delete(`boutique/produits/${id}/`);
};

export const createCategoryProduit = async (payload: any): Promise<CategoryProduit> => {
  const formData = new FormData();
  formData.append('nom', payload.nom);
  formData.append('boutique', payload.boutique);
  if (payload.image) {
    formData.append('image_file', payload.image); // le champ attendu par le serializer
  }

  const response = await api.post<CategoryProduit>(
    'boutique/category-produits/',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};


export const updateCategoryProduit = async (id: number, payload: any): Promise<CategoryProduit> => {
  const response = await api.put<CategoryProduit>(`boutique/category-produits/${id}/`, payload);
  return response.data;
};

export const deleteCategoryProduit = async (id: number): Promise<void> => {
  await api.delete(`boutique/category-produits/${id}/`);
};

export const getBoutiques = async (currentPage: number, pageSize: number): Promise<Boutique[]> => {
  const response = await api.get<Boutique[]>('boutique/boutiques/');
  console.log('getBoutiques response:', response.data);
  return response.data;
};


export const getBoutiquechat = async (boutiqueId?: string): Promise<Boutique[]> => {
  try {
    const response = await api.get<Boutique[] | Boutique>('boutique/boutiquechat/', {
      params: boutiqueId ? { boutique_id: boutiqueId } : {},
    });
    console.log('Boutique response:', response.data);
    // Normalize response to always return an array
    return Array.isArray(response.data) ? response.data : [response.data];
  } catch (error) {
    console.error('Error fetching boutiques:', error);
    throw error;
  }
};

export const updateBoutique = async (id: number, boutiqueData: BoutiqueUpdatePayload): Promise<Boutique> => {
  const formData = new FormData();
  Object.entries(boutiqueData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value as string | Blob);
    }
  });
  const response = await api.put<Boutique>(`boutique/boutiques/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
export const getBoutiqueDetails = async (boutiqueId: string): Promise<{
  boutique: Boutique;
  categories: CategoryProduit[];
  products: Product[];
}> => {
  try {
    const response = await api.get(`boutique/boutiques/${boutiqueId}/details/`);
    
    // Validation des données reçues
    if (!response.data || !response.data.boutique) {
      throw new Error('Données de boutique invalides');
    }
    
    return {
      boutique: response.data.boutique,
      categories: response.data.categories || [],
      products: response.data.products || []
    };
  } catch (error) {
    console.error('Error fetching boutique details:', error);
    throw error;
  }
};

export const submitRating = (produitId: number, value: number) => {
  return axios.post(`http://localhost:8000/boutique/produits/${produitId}/rating/`, {
    value: value, // 👈 assure-toi que c'est bien "value"
  });
};

export const getPopularProducts = async () => {
  try {
    const response = await axios.get('http://localhost:8000/boutique/products/popular/');
    return response.data;
  } catch (error) {
    console.error('Error fetching popular products:', error);
    throw error;
  }
};

export const getNewProducts = async () => {
  try {
    const response = await axios.get('http://localhost:8000/boutique/produits/new/');
    return response.data;
  } catch (error) {
    console.error('Error fetching new products:', error);
    throw error;
  }
};