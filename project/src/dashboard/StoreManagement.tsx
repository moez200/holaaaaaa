
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { getBoutiques, updateBoutique } from '../services/productproduitservice';
import { Boutique, BoutiqueUpdatePayload } from '../types';
import { Edit, Building, UploadCloud } from 'lucide-react';
import { Box, Typography, Button, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

interface StoreManagementProps {
  boutiqueId: string;
}

const StoreManagement: React.FC<StoreManagementProps> = ({ boutiqueId }) => {
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
    logo: '',
    coverImage: '',
    category: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });
  const [error, setError] = useState<string>('');

  const categories = ['Fashion', 'Electronics', 'Home', 'Beauty', 'Sports'];

  useEffect(() => {
    const fetchBoutique = async () => {
      try {
        const boutiques = await getBoutiques();
        const boutiqueData = boutiques.find((b) => b.id.toString() === boutiqueId);
        if (!boutiqueData) {
          setError('Boutique not found.');
          return;
        }
        setBoutique(boutiqueData);
        setFormData({
          storeName: boutiqueData.nom || '',
          description: boutiqueData.description || '',
          logo: typeof boutiqueData.logo === 'string' ? boutiqueData.logo : '',
          coverImage: typeof boutiqueData.image === 'string' ? boutiqueData.image : '',
          category: boutiqueData.category_boutique ? String(boutiqueData.category_boutique) : '',
          address: boutiqueData.adresse || '',
          phone: boutiqueData.telephone || '',
          email: boutiqueData.email || '',
          website: boutiqueData.website || '',
        });
      } catch (err) {
        setError('Failed to fetch boutique.');
      }
    };
    fetchBoutique();
  }, [boutiqueId]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!boutique) return;
    try {
      const payload: BoutiqueUpdatePayload = {
        nom: formData.storeName,
        description: formData.description,
        logo: formData.logo,
        image: formData.coverImage || null,
        category_boutique: formData.category,
        adresse: formData.address,
        telephone: formData.phone,
        email: formData.email,
       
      };
      const updatedBoutique = await updateBoutique(boutique.id, payload);
      setBoutique(updatedBoutique);
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError('Failed to update boutique.');
    }
  };

  if (!boutique) {
    return <Box p={4}><Typography>Loading...</Typography></Box>;
  }

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Store Management</Typography>
          <Typography color="text.secondary">Customize your store details</Typography>
        </Box>
        {!isEditing && (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        )}
      </Box>

 

      {!isEditing ? (
        <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1, overflow: 'hidden' }}>
          <Box sx={{ height: 192, bgcolor: 'linear-gradient(to right, #3b82f6, #8b5cf6)', position: 'relative' }}>
            {formData.coverImage && (
              <img
                src={formData.coverImage}
                alt="Store Cover"
                style={{ height: '100%', width: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
              />
            )}
            <Box sx={{ position: 'absolute', bottom: 16, left: 24, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ height: 64, width: 64, borderRadius: 1, bgcolor: 'white', p: 1, mr: 2, boxShadow: 3 }}>
                {formData.logo ? (
                  <img
                    src={formData.logo}
                    alt="Store Logo"
                    style={{ height: '100%', width: '100%', objectFit: 'cover', borderRadius: 4 }}
                  />
                ) : (
                  <Box sx={{ height: '100%', width: '100%', bgcolor: 'grey.200', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building size={32} color="#9ca3af" />
                  </Box>
                )}
              </Box>
              <Box>
                <Typography variant="h5" color="white" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {formData.storeName}
                </Typography>
                <Box component="span" sx={{ bgcolor: 'blue.200', color: 'blue.800', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.75rem' }}>
                  {formData.category}
                </Box>
              </Box>
            </Box>
          </Box>

          <Box p={4}>
            <Box mb={4}>
              <Typography variant="h6" fontWeight="medium" mb={1}>Description</Typography>
              <Typography color="text.secondary">
                {formData.description || 'No description available.'}
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
              <Box>
                <Typography variant="h6" fontWeight="medium" mb={2}>Store Statistics</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'grey.200', pb: 1 }}>
                    <Typography color="text.secondary">Creation Date</Typography>
                    <Typography fontWeight="medium">12/05/2023</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'grey.200', pb: 1 }}>
                    <Typography color="text.secondary">Total Products</Typography>
                    <Typography fontWeight="medium">24</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'grey.200', pb: 1 }}>
                    <Typography color="text.secondary">Total Orders</Typography>
                    <Typography fontWeight="medium">156</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Average Rating</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography fontWeight="medium" mr={1}>4.8</Typography>
                      <Box sx={{ display: 'flex' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-4 w-4 ${star <= 4.8 ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 15.934l-6.18 3.254 1.18-6.875L.1 7.628l6.9-1.003L10 .5l3 6.125 6.9 1.003-4.9 4.685 1.18 6.875L10 15.934z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box>
                <Typography variant="h6" fontWeight="medium" mb={2}>Contact Information</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'grey.200', pb: 1 }}>
                    <Typography color="text.secondary">Email</Typography>
                    <Typography fontWeight="medium">{formData.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'grey.200', pb: 1 }}>
                    <Typography color="text.secondary">Phone</Typography>
                    <Typography fontWeight="medium">{formData.phone || 'Not provided'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'grey.200', pb: 1 }}>
                    <Typography color="text.secondary">Address</Typography>
                    <Typography fontWeight="medium">{formData.address || 'Not provided'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Website</Typography>
                    <Typography fontWeight="medium" color="blue.600">{formData.website || 'Not provided'}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1, p: 4 }}>
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box>
              <InputLabel htmlFor="storeName">Store Name</InputLabel>
              <TextField
                fullWidth id="storeName" name="storeName" value={formData.storeName}
                onChange={handleInputChange} required
              />
            </Box>
            <Box>
              <InputLabel htmlFor="description">Description</InputLabel>
              <TextField
                fullWidth id="description" name="description" value={formData.description}
                onChange={handleInputChange} multiline rows={4}
              />
            </Box>
            <Box>
              <InputLabel htmlFor="category">Category</InputLabel>
              <Select
                fullWidth id="category" name="category" value={formData.category}
                onChange={handleInputChange}
              >
                <MenuItem value="">Select a category</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <InputLabel htmlFor="logo">Logo</InputLabel>
                <TextField
                  fullWidth id="logo" name="logo" value={formData.logo}
                  onChange={handleInputChange} placeholder="Image URL"
                />
              </Box>
              <Box>
                <InputLabel htmlFor="coverImage">Cover Image</InputLabel>
                <TextField
                  fullWidth id="coverImage" name="coverImage" value={formData.coverImage}
                  onChange={handleInputChange} placeholder="Image URL"
                />
              </Box>
            </Box>
            <Box>
              <InputLabel htmlFor="address">Address</InputLabel>
              <TextField
                fullWidth id="address" name="address" value={formData.address}
                onChange={handleInputChange}
              />
            </Box>
            <Box>
              <InputLabel htmlFor="phone">Phone</InputLabel>
              <TextField
                fullWidth id="phone" name="phone" value={formData.phone}
                onChange={handleInputChange}
              />
            </Box>
            <Box>
              <InputLabel htmlFor="email">Email</InputLabel>
              <TextField
                fullWidth id="email" name="email" value={formData.email}
                onChange={handleInputChange} type="email"
              />
            </Box>
            <Box>
              <InputLabel htmlFor="website">Website</InputLabel>
              <TextField
                fullWidth id="website" name="website" value={formData.website}
                onChange={handleInputChange}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 3, borderTop: '1px solid', borderColor: 'grey.200' }}>
            <Button
              variant="outlined"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
            >
              Save
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default StoreManagement;