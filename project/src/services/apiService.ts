import api from "../axiosInstance";


// Category Boutique API calls
export const getCategoryBoutiques = async () => {
  const response = await api.get('/category_boutiques/');
  return response.data;
};



// Boutique API calls
export const getBoutiques = async () => {
  const response = await api.get('/boutiques/');
  return response.data;
};

export const getBoutiqueById = async (id: number) => {
  const response = await api.get(`/boutiques/${id}/`);
  return response.data;
};


export const updateBoutique = async (id: number, data: any) => {
  const response = await api.put(`/boutiques/${id}/`, data);
  return response.data;
};

// Category Produit API calls
export const getCategoryProduits = async () => {
  const response = await api.get('/category_produits/');
  return response.data;
};

export const createCategoryProduit = async (data: any) => {
  const response = await api.post('/category_produits/', data);
  return response.data;
};

// Produit API calls
export const getProduits = async () => {
  const response = await api.get('/produits/');
  return response.data;
};

export const getProduitById = async (id: number) => {
  const response = await api.get(`/produits/${id}/`);
  return response.data;
};

export const createProduit = async (data: any) => {
  const response = await api.post('/produits/', data);
  return response.data;
};

export const updateProduit = async (id: number, data: any) => {
  const response = await api.put(`/produits/${id}/`, data);
  return response.data;
};

export const deleteProduit = async (id: number) => {
  const response = await api.delete(`/produits/${id}/`);
  return response.data;
};

// User management API calls
export const getUsers = async () => {
  const response = await api.get('/users/list/');
  return response.data;
};

export const getUserDetails = async () => {
  const response = await api.get('/users/me/');
  return response.data;
};

export const updateUser = async (id: number, data: any) => {
  const response = await api.put(`/users/update/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await api.delete(`/users/delete/${id}`);
  return response.data;
};

export const approveMerchant = async (id: number) => {
  const response = await api.post(`/users/approve/${id}`);
  return response.data;
};

export const refuseMerchant = async (id: number) => {
  const response = await api.post(`/users/refuse/${id}`);
  return response.data;
};

export default api;