import api from '../axiosInstance';
import { ProduitCreatePayload, ProduitUpdatePayload, CategoryProduitCreatePayload, CategoryProduitUpdatePayload, Boutique, BoutiqueUpdatePayload, CategoryProduit, CategoryBoutique, product, Produit } from '../types';




// CategoryBoutique Services
export const getCategoryBoutiques = async (): Promise<CategoryBoutique[]> => {
  const response = await api.get<CategoryBoutique[]>('boutique/category_boutiques/');
  return response.data;
};

export const getBoutiquesall = async (): Promise<Boutique[]> => {
  try {
    const response = await api.get('boutique/boutiques/all/');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching boutiques:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error(error.response?.data?.detail || 'Failed to fetch boutiques');
  }
};
// Boutique Services
export const createBoutique = async (boutiqueData: FormData): Promise<Boutique> => {
  try {
    const response = await api.post(`boutique/boutiques/`, boutiqueData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating boutique:', error);
    throw error;
  }
};

export const getBoutiquesByCategory = async (categoryId: number): Promise<Boutique[]> => {
  try {
    const response = await api.get(`boutique/category_boutiques/${categoryId}/boutiques/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching boutiques by category:', error);
    throw error;
  }
};

export const getBoutiques = async (): Promise<Boutique[]> => {
  const response = await api.get<Boutique[]>('boutique/boutiques/');
  return response.data;
};

export const getBoutiquechat = async (boutiqueId?: string): Promise<Boutique[]> => {
  try {
    const response = await api.get<Boutique[] | Boutique>('boutique/boutiquechat/', {
      params: boutiqueId ? { boutique_id: boutiqueId } : {},
    });
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
  products: product[];
}> => {
  try {
    const response = await api.get(`boutique/boutiques/${boutiqueId}/details/`);
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

export const getBoutiqueProductsByCategory = async (boutiqueId: string, categoryId: string): Promise<product[]> => {
  try {
    const response = await api.get(`boutique/boutiques/${boutiqueId}/categories/${categoryId}/produits/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

// Produit Services
export const getProduits = async (categoryProduitId?: string): Promise<product[]> => {
  const params = categoryProduitId ? { category_produit_id: categoryProduitId } : {};
  const response = await api.get<product[]>('boutique/produits/', { params });
  return response.data;
};

export const createProduit = async (produitData: ProduitCreatePayload): Promise<product> => {
  const formData = new FormData();
  Object.entries(produitData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value as string | Blob);
    }
  });
  const response = await api.post<product>('boutique/produits/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateProduit = async (id: number, produitData: ProduitUpdatePayload): Promise<product> => {
  const formData = new FormData();
  Object.entries(produitData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value as string | Blob);
    }
  });
  const response = await api.put<product>(`boutique/produits/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteProduit = async (id: number): Promise<void> => {
  await api.delete(`boutique/produits/${id}/`);
};

// CategoryProduit Services
export const getCategoryProduits = async (): Promise<CategoryProduit[]> => {
  const response = await api.get<CategoryProduit[]>('boutique/category_produits/');
  return response.data;
};

export const createCategoryProduit = async (categoryData: CategoryProduitCreatePayload): Promise<CategoryProduit> => {
  const formData = new FormData();
  Object.entries(categoryData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value as string | Blob);
    }
  });
  const response = await api.post<CategoryProduit>('boutique/category_produits/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateCategoryProduit = async (
  id: number,
  categoryData: CategoryProduitUpdatePayload
): Promise<CategoryProduit> => {
  const formData = new FormData();
  Object.entries(categoryData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value as string | Blob);
    }
  });
  const response = await api.put<CategoryProduit>(`boutique/boutique/category_produits/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteCategoryProduit = async (id: number): Promise<void> => {
  await api.delete(`boutique/category_produits/${id}/`);
};
// boutiqueService.ts
export const getAllBoutiques = async (
  page: number = 1,
  pageSize: number = 10
): Promise<{
  success: boolean;
  boutiques: Boutique[];
  count: number;
  total_pages: number;
  current_page: number;
  error?: string;
}> => {
  try {
    const response = await api.get('/boutique/boutiquesall/', {
      params: { page, page_size: pageSize },
    });
    return {
      success: true,
      boutiques: response.data.boutiques || [],
      count: response.data.count || 0,
      total_pages: response.data.total_pages || 1,
      current_page: response.data.current_page || 1,
    };
  } catch (error: any) {
    console.error('Error in getAllBoutiques:', error);
    return {
      success: false,
      boutiques: [],
      count: 0,
      total_pages: 1,
      current_page: 1,
      error: error.message || 'Failed to fetch boutiques',
    };
  }
};
export const approveBoutique = async (id: number): Promise<Boutique> => {
    const response = await api.post(`/boutique/approve/${id}/`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  };

export const rejectBoutique = async (id: number): Promise<Boutique> => {
    const response = await api.post(`/boutique/reject/${id}/`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data;
  };

export const deleteBoutique = async (
  boutiqueId: number
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await api.delete(`/boutique/${boutiqueId}/delete/`);
    return { success: true, message: response.data.message };
  } catch (error: any) {
    console.error(`Error deleting boutique ${boutiqueId}:`, error);
    return { success: false, error: error.response?.data?.error || error.message };
  }
};










export const getDashboardOverview = async (boutiqueId: string): Promise<{
  total_sales: number;
  total_orders: number;
  total_products: number;
  active_customers: number;
}> => {
  try {
    const response = await api.get(`boutique/boutiques/${boutiqueId}/dashboard/overview/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    throw error;
  }
};

export const getMonthlySales = async (boutiqueId: string): Promise<{ month: string; sales: number }[]> => {
  try {
    const response = await api.get(`boutique/boutiques/${boutiqueId}/dashboard/monthly-sales/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    throw error;
  }
};

export const getProductsByCategory = async (boutiqueId: string): Promise<{ category: string; product_count: number }[]> => {
  try {
    const response = await api.get(`boutique/boutiques/${boutiqueId}/dashboard/products-by-category/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

export const getTopSellingProducts = async (boutiqueId: number): Promise<Produit[]> => {
  const response = await api.get(`boutique/boutiques/${boutiqueId}/dashboard/top-selling-products/`);
  console.log('hhhh',response)
  return response.data.map((item: Produit) => ({
    id: item.id,
    nom: item.nom,
    category_name: item.category_name,
    prix: item.prix != null ? parseFloat(item.prix.toString()) : 0,
    total_sold: item.total_sold || 0,
    stock: item.stock || 0,
    image: item.image,
  }));
};

export const getOutOfStockProducts = async (boutiqueId: string): Promise<number> => {
  try {
    const response = await api.get(`boutique/boutiques/${boutiqueId}/dashboard/out-of-stock-products/`);
    return response.data.out_of_stock_count;
  } catch (error) {
    console.error('Error fetching out-of-stock products:', error);
    throw error;
  }
};