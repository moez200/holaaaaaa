import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { getCategories } from '../../services/categorieService';
import { createBoutique } from '../../services/boutiqueService';
import { CategoryBoutique, Boutique } from '../../types';
import { useAuthStore } from '../../components/Store/authStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getBoutiques } from '../../services/productproduitservice';

// Styles
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Poppins', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

const Section = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 3rem;
  color: #4a00e0;
  text-align: center;
  margin-bottom: 2rem;
  background: linear-gradient(45deg, #4a00e0, #8e2de2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const BoutiquesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const CategoryCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.15);
    border-color: #8e2de2;
  }
`;

const BoutiqueCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.15);
    border-color: #4a00e0;
  }
`;

const CategoryImage = styled.div`
  width: 80px;
  height: 80px;
  margin-bottom: 1rem;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const BoutiqueImage = styled.div`
  width: 80px;
  height: 80px;
  margin-bottom: 1rem;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CategoryName = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const BoutiqueName = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const FormContainer = styled.div`
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 15px 35px rgba(0,0,0,0.2);
  margin-top: 1rem;
`;

const FormTitle = styled.h2`
  color: #4a00e0;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
  
  &:focus {
    outline: none;
    border-color: #8e2de2;
    box-shadow: 0 0 0 3px rgba(142, 45, 226, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: all 0.3s;
  
  &:focus {
    outline: none;
    border-color: #8e2de2;
    box-shadow: 0 0 0 3px rgba(142, 45, 226, 0.2);
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const ShopCreatorPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [categories, setCategories] = useState<CategoryBoutique[]>([]);
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryBoutique | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [shopData, setShopData] = useState({
    nom: '',
    description: '',
    adresse: '',
    telephone: '',
    email: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const fetchedCategories = await getCategories({ cacheBust: Date.now() });
        setCategories(fetchedCategories);
        if (fetchedCategories.length === 0) {
          setError('No categories found. Please try again later.');
        }
      } catch (err) {
        setError('Failed to load categories. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch user boutiques
  useEffect(() => {
    const fetchUserBoutiques = async () => {
      if (!isAuthenticated || !user?.id) return;
      setLoading(true);
      try {
        const fetchedBoutiques = await getBoutiques(); // Changed to getUserBoutiques
        console.log('Fetched boutiques:', fetchedBoutiques);
        setBoutiques(fetchedBoutiques);
      } catch (err) {
        console.error('Fetch boutiques error:', err);
        setError('Failed to load boutiques.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserBoutiques();
  }, [isAuthenticated, user?.id]);

  const handleCategorySelect = (category: CategoryBoutique) => {
    setSelectedCategory(category);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setShopData({
      nom: '',
      description: '',
      adresse: '',
      telephone: '',
      email: '',
    });
    setImage(null);
    setLogo(null);
    setError(null);
    setFieldErrors({});
    setSelectedCategory(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShopData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files[0]) {
      setImage(files[0]);
      setFieldErrors((prev) => ({ ...prev, image: '' }));
    }
  };

  const handleFileChangeLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files[0]) {
      setLogo(files[0]);
      setFieldErrors((prev) => ({ ...prev, logo: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !isAuthenticated || !user?.id) {
      setError('Please select a category and ensure you are logged in.');
      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const formData = new FormData();
      formData.append('nom', shopData.nom);
      if (shopData.description) formData.append('description', shopData.description);
      if (shopData.adresse) formData.append('adresse', shopData.adresse);
      if (shopData.telephone) formData.append('telephone', shopData.telephone);
      if (shopData.email) formData.append('email', shopData.email);
      formData.append('category_boutique', selectedCategory.id!.toString());
      formData.append('marchand', user.id.toString());

      if (logo instanceof File) {
        formData.append('logo_input', logo);
      }
      if (image instanceof File) {
        formData.append('image_input', image);
      }

      const newBoutique = await createBoutique(formData);
      toast.success('Boutique added successfully!');
      setBoutiques((prev) => [...prev, newBoutique]);
      handleCloseDialog();
    } catch (err: any) {
      if (err.response?.data) {
        const errors = err.response.data;
        const newFieldErrors: Record<string, string> = {};
        Object.keys(errors).forEach((key) => {
          newFieldErrors[key] = errors[key][0] || 'Invalid value';
        });
        setFieldErrors(newFieldErrors);
        setError('Please correct the errors in the form.');
      } else {
        setError('Failed to create boutique. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBoutiqueClick = (boutiqueId: number) => {
    navigate(`/MerchantDashboard/${boutiqueId}`);
  };

  return (
    <Container>
      {/* Top Half: Categories */}
      <Section>
        <Title>Créez Votre Boutique en Ligne</Title>
        <h2 style={{ textAlign: 'center', color: '#555', marginBottom: '2rem' }}>
          Choisissez une catégorie pour votre boutique
        </h2>
        {loading && <p>Loading categories...</p>}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <CategoriesGrid>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategorySelect(category)}
            >
              <CategoryImage>
                <img
                  src={category.image || 'https://via.placeholder.com/80'}
                  alt={category.nom}
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/80';
                  }}
                />
              </CategoryImage>
              <CategoryName>{category.nom}</CategoryName>
            </CategoryCard>
          ))}
        </CategoriesGrid>
      </Section>

      {/* Bottom Half: User Boutiques */}
      <Section>
        <Title>Vos Boutiques</Title>
        {boutiques.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#555' }}>
            Vous n'avez pas encore créé de boutiques.
          </p>
        ) : (
          <BoutiquesGrid>
            {boutiques.map((boutique) => (
              <BoutiqueCard
                key={boutique.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBoutiqueClick(boutique.id)}
              >
                <BoutiqueImage>
                  <img
                    src={boutique.logo || 'https://via.placeholder.com/80'}
                    alt={boutique.nom}
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/80';
                    }}
                  />
                </BoutiqueImage>
                <BoutiqueName>{boutique.nom}</BoutiqueName>
              </BoutiqueCard>
            ))}
          </BoutiquesGrid>
        )}
      </Section>

      {/* Dialog for creating boutique */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle style={{ textAlign: 'center', color: '#4a00e0' }}>
          Créer une boutique {selectedCategory?.nom}
        </DialogTitle>
        <DialogContent>
          {selectedCategory && (
            <FormContainer>
              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label htmlFor="nom">Nom de la boutique</Label>
                  <Input
                    type="text"
                    id="nom"
                    name="nom"
                    value={shopData.nom}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Ma Belle Boutique"
                  />
                  {fieldErrors.nom && <ErrorMessage>{fieldErrors.nom}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="description">Description</Label>
                  <TextArea
                    id="description"
                    name="description"
                    value={shopData.description}
                    onChange={handleInputChange}
                    placeholder="Décrivez votre boutique en quelques mots..."
                  />
                  {fieldErrors.description && <ErrorMessage>{fieldErrors.description}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="adresse">Adresse</Label>
                  <Input
                    type="text"
                    id="adresse"
                    name="adresse"
                    value={shopData.adresse}
                    onChange={handleInputChange}
                    placeholder="Adresse physique de votre boutique"
                  />
                  {fieldErrors.adresse && <ErrorMessage>{fieldErrors.adresse}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={shopData.telephone}
                    onChange={handleInputChange}
                    placeholder="Numéro de téléphone"
                  />
                  {fieldErrors.telephone && <ErrorMessage>{fieldErrors.telephone}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={shopData.email}
                    onChange={handleInputChange}
                    placeholder="Email de contact"
                  />
                  {fieldErrors.email && <ErrorMessage>{fieldErrors.email}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="logo">Logo</Label>
                  <Input
                    type="file"
                    id="logo"
                    name="logo"
                    accept="image/*"
                    onChange={handleFileChangeLogo}
                  />
                  {fieldErrors.logo && <ErrorMessage>{fieldErrors.logo}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="image">Image de la boutique</Label>
                  <Input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {fieldErrors.image && <ErrorMessage>{fieldErrors.image}</ErrorMessage>}
                </FormGroup>
              </form>
            </FormContainer>
          )}
        </DialogContent>
        <DialogActions style={{ padding: '20px' }}>
          <Button onClick={handleCloseDialog} style={{ color: '#666' }}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: 'linear-gradient(45deg, #4a00e0, #8e2de2)',
              color: 'white',
              padding: '8px 20px',
            }}
          >
            {loading ? 'Création...' : 'Créer la Boutique'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ShopCreatorPage;