

import api from '../axiosInstance';
import { CategoryBoutique } from '../types';
export const getCategories = async (): Promise<CategoryBoutique[]> => {
  console.log('getCategories')
  try {
    const response = await api.get(`/boutique/category_boutiques/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};


export const getCategory = async (id: number): Promise<CategoryBoutique> => {
  const response = await api.get(`/boutique/category_boutiques/${id}`);
  return response.data;
};

export const createCategory = async (
    category: Partial<CategoryBoutique> & { imageFile?: File }
  ): Promise<CategoryBoutique> => {
    const formData = new FormData();
    formData.append('nom', category.nom || '');
  
    if (category.imageFile) {
      formData.append('image', category.imageFile);
      console.log('📸 Image ajoutée au FormData:', category.imageFile.name);
    } else {
      console.log('⚠️ Aucune image sélectionnée');
    }
  
    console.log('📦 Données envoyées:', {
      nom: category.nom,
      image: category.imageFile ? category.imageFile.name : null,
    });
  
    try {
      const response = await api.post(`/boutique/category_boutiques/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('✅ Réponse du serveur:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur lors de la création de la catégorie:', error.response?.data || error.message);
      throw error;
    }
  };
  

  export const updateCategory = async (id: number | undefined, category: Partial<CategoryBoutique> & { imageFile?: File }): Promise<CategoryBoutique> => {
    const formData = new FormData();
    formData.append('nom', category.nom || '');
    if (category.imageFile) {
      formData.append('image', category.imageFile);
    }
    const response = await api.put(`/boutique/category_boutiques/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  };

export const deleteCategory = async (id: number |undefined): Promise<void> => {
  await api.delete(`/boutique/category_boutiques/${id}/`);
};







