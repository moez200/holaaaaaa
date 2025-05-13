import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, InputLabel, FormControl,
  Typography, Box, Alert, SelectChangeEvent, Card, CardContent, CardMedia, CardActions, Grid, IconButton, CircularProgress
} from '@mui/material';
import { Add, Edit, Delete, Save, Cancel } from '@mui/icons-material';
import {
  getCategoryProduits, getProduits, updateProduit, createProduit, updateCategoryProduit,
  createCategoryProduit, deleteProduit, deleteCategoryProduit
} from '../services/productproduitservice';
import { CategoryProduit, CategoryProduitCreatePayload, Produit, ProduitCreatePayload } from '../types';

interface ProductManagementProps {
  boutiqueId: string;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ boutiqueId }) => {
  // State for products, categories, and UI
  const [produits, setProduits] = useState<Produit[]>([]);
  const [categories, setCategories] = useState<CategoryProduit[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  // Form states
  const [productForm, setProductForm] = useState<ProduitCreatePayload>({
    nom: '', description: '', prix: '', stock: '', couleur: '', taille: '', image: null, category_produit: '', boutique: boutiqueId,
  });
  const [categoryForm, setCategoryForm] = useState<CategoryProduitCreatePayload>({ nom: '', image: null as File | null, boutique: boutiqueId });

  // Fetch categories on mount and when boutiqueId changes
  useEffect(() => {
    const fetchData = async () => {
      if (!boutiqueId) {
        setError('No boutique ID provided.');
        return;
      }
      setLoading(true);
      try {
        const categoriesData = await getCategoryProduits(boutiqueId);
        setCategories(categoriesData);
        if (categoriesData.length === 0) {
          setError('No categories found for this boutique.');
        }
      } catch (err) {
        setError('Failed to fetch categories. Please try again.');
        console.error('Fetch categories error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [boutiqueId]);

  // Fetch products when selectedCategory or boutiqueId changes
  useEffect(() => {
    const fetchProduits = async () => {
      if (!boutiqueId) return;
      setLoading(true);
      try {
        const produitsData = await getProduits(selectedCategory || undefined, boutiqueId);
        setProduits(produitsData);
        console.log('Fetched Products:', produitsData);
      } catch (err) {
        setError('Failed to fetch products. Please try again.');
        console.error('Fetch products error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduits();
  }, [selectedCategory, boutiqueId]);

  // Handle product form input changes
  const handleProductFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target as HTMLInputElement | { name: string; value: string };
    const files = (e.target as HTMLInputElement).files;
    setProductForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Handle category form input changes
  const handleCategoryFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files) {
      setCategoryForm((prev) => ({
        ...prev,
        image: files[0],
      }));
    } else {
      setCategoryForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle opening product dialog
  const handleOpenProductDialog = () => {
    setEditingProductId(null); // Reset for new product
    setProductForm({
      nom: '',
      description: '',
      prix: '',
      stock: '',
      couleur: '',
      taille: '',
      image: null,
      category_produit: selectedCategory || '', // Pre-populate with selectedCategory
      boutique: boutiqueId,
    });
    setOpenProductDialog(true);
  };

  // Handle product form submission
  const handleProductSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!productForm.boutique) {
      setError('Boutique ID is required.');
      return;
    }
    setLoading(true);
    try {
      if (editingProductId) {
        const updatedProduit = await updateProduit(editingProductId, productForm);
        setProduits(produits.map((p) => (p.id === editingProductId ? updatedProduit : p)));
        setEditingProductId(null);
      } else {
        const newProduit = await createProduit({ ...productForm, category_produit: productForm.category_produit || selectedCategory });
        setProduits([...produits, newProduit]);
      }
      setProductForm({
        nom: '', description: '', prix: '', stock: '', couleur: '', taille: '', image: null,
        category_produit: '', boutique: boutiqueId,
      });
      setOpenProductDialog(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product. Please check your input.');
      console.error('Product submit error:', err);
    } finally {
      setLoading(false);
    }
  };
  // Handle category form submission
  const handleCategorySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryForm.boutique) {
      setError('Boutique ID is required.');
      return;
    }
    setLoading(true);
    try {
      if (editingCategoryId) {
        const updatedCategory = await updateCategoryProduit(editingCategoryId, {
          ...categoryForm,
          boutique: boutiqueId,
        });
        setCategories(categories.map((c) => (c.id === editingCategoryId ? updatedCategory : c)));
        setEditingCategoryId(null);
      } else {
        const newCategory = await createCategoryProduit(categoryForm);
        setCategories([...categories, newCategory]);
      }
      setCategoryForm({ nom: '', image: null, boutique: boutiqueId });
      setOpenCategoryDialog(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.non_field_errors?.[0] || 'Failed to save category.');
      console.error('Category submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle product edit
  const handleEditProduct = (produit: Produit) => {
    setEditingProductId(produit.id);
    setProductForm({
      nom: produit.nom,
      description: produit.description || '',
      prix: produit.prix,
      stock: produit.stock.toString(),
      couleur: produit.couleur || '',
      taille: produit.taille || '',
      image: null,
      category_produit: produit.category_produit.toString(),
      boutique: produit.boutique.toString(),
    });
    setOpenProductDialog(true);
  };

  // Handle category edit
  const handleEditCategory = (category: CategoryProduit) => {
    setEditingCategoryId(category.id);
    setCategoryForm({ nom: category.nom, image: null, boutique: category.boutique.toString() });
    setOpenCategoryDialog(true);
  };

  // Handle product deletion
  const handleDeleteProduct = async (id: number) => {
    setLoading(true);
    try {
      await deleteProduit(id);
      setProduits(produits.filter((p) => p.id !== id));
      setError('');
    } catch (err) {
      setError('Failed to delete product.');
      console.error('Delete product error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (id: number) => {
    setLoading(true);
    try {
      await deleteCategoryProduit(id);
      setCategories(categories.filter((c) => c.id !== id));
      setError('');
    } catch (err) {
      setError('Failed to delete category.');
      console.error('Delete category error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get image URL
  const getImageUrl = (image: string | File | null, context: 'Product' | 'Category', itemName: string) => {
    if (typeof image === 'string' && image) {
      return image;
    }
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    return 'https://via.placeholder.com/140';
  };

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={4}>Product Management</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Category Section */}
      <Box mb={8}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight="medium">Categories</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenCategoryDialog(true)}
            disabled={loading}
          >
            Add Category
          </Button>
        </Box>

        {/* Category Dialog */}
        <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)}>
          <DialogTitle>{editingCategoryId ? 'Edit Category' : 'Add Category'}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth margin="dense" label="Category Name" name="nom" value={categoryForm.nom}
              onChange={handleCategoryFormChange} required
            />
            <TextField
              fullWidth margin="dense" type="file" name="image" onChange={handleCategoryFormChange}
              InputLabelProps={{ shrink: true }} label="Image"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCategoryDialog(false)} startIcon={<Cancel />}>Cancel</Button>
            <Button onClick={handleCategorySubmit} variant="contained" startIcon={<Save />} disabled={loading}>
              {editingCategoryId ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Category Cards */}
        <Grid container spacing={3}>
          {categories.length === 0 && !loading && (
            <Grid item xs={12}>
              <Typography>No categories found.</Typography>
            </Grid>
          )}
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={getImageUrl(category.image, 'Category', category.nom)}
                  alt={category.nom}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">{category.nom}</Typography>
                  {!category.image && (
                    <Typography variant="body2" color="text.secondary">No image available</Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <IconButton onClick={() => handleEditCategory(category)} disabled={loading}><Edit /></IconButton>
                  <IconButton onClick={() => handleDeleteCategory(category.id)} disabled={loading}><Delete /></IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Category Filter */}
      <Box mb={4}>
        <FormControl fullWidth>
          <InputLabel>Filter by Category</InputLabel>
          <Select
            value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} label="Filter by Category"
            disabled={loading}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id.toString()}>{category.nom}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Product Section */}
      <Box mb={8}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight="medium">Products</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenProductDialog} // Updated to use new handler
            disabled={loading}
          >
            Add Product
          </Button>
        </Box>

        {/* Product Dialog */}
        <Dialog open={openProductDialog} onClose={() => setOpenProductDialog(false)}>
          <DialogTitle>{editingProductId ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth margin="dense" label="Product Name" name="nom" value={productForm.nom}
              onChange={handleProductFormChange} required
            />
            <TextField
              fullWidth margin="dense" label="Description" name="description" value={productForm.description}
              onChange={handleProductFormChange} multiline rows={3}
            />
            <TextField
              fullWidth margin="dense" label="Price" name="prix" type="number" value={productForm.prix}
              onChange={handleProductFormChange} required
            />
            <TextField
              fullWidth margin="dense" label="Stock" name="stock" type="number" value={productForm.stock}
              onChange={handleProductFormChange} required
            />
            <TextField
              fullWidth margin="dense" label="Color" name="couleur" value={productForm.couleur}
              onChange={handleProductFormChange}
            />
            <TextField
              fullWidth margin="dense" label="Size" name="taille" value={productForm.taille}
              onChange={handleProductFormChange}
            />
<FormControl fullWidth margin="dense">
  <InputLabel>Category</InputLabel>
  <Select
    name="category_produit"
    value={productForm.category_produit}
    onChange={(e: SelectChangeEvent<string>) => handleProductFormChange(e)}
    label="Category"
    required
  >
    <MenuItem value="">Select Category</MenuItem>
    {categories.map((category) => (
      <MenuItem key={category.id} value={category.id.toString()}>{category.nom}</MenuItem>
    ))}
  </Select>
</FormControl>
            <TextField
              fullWidth margin="dense" type="file" name="image" onChange={handleProductFormChange}
              InputLabelProps={{ shrink: true }} label="Image"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenProductDialog(false)} startIcon={<Cancel />}>Cancel</Button>
            <Button onClick={handleProductSubmit} variant="contained" startIcon={<Save />} disabled={loading}>
              {editingProductId ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Product Cards */}
        <Grid container spacing={3}>
          {produits.length === 0 && !loading && (
            <Grid item xs={12}>
              <Typography>No products found.</Typography>
            </Grid>
          )}
          {produits.map((produit) => (
            <Grid item xs={12} sm={6} md={4} key={produit.id}>
              <Card sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={getImageUrl(produit.image, 'Product', produit.nom)}
                  alt={produit.nom}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">{produit.nom}</Typography>
                  <Typography variant="body2" color="text.secondary">Price: DT{produit.prix}</Typography>
                  <Typography variant="body2" color="text.secondary">Stock: {produit.stock}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Category: {produit.category_produit_details?.nom || 'N/A'}
                  </Typography>
                  {!produit.image && (
                    <Typography variant="body2" color="text.secondary">No image available</Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <IconButton onClick={() => handleEditProduct(produit)} disabled={loading}><Edit /></IconButton>
                  <IconButton onClick={() => handleDeleteProduct(produit.id)} disabled={loading}><Delete /></IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default ProductManagement;