import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, InputLabel, FormControl,
  Typography, Box, Alert, SelectChangeEvent, Card, CardContent, CardActions, Grid, IconButton, CircularProgress
} from '@mui/material';
import { Add, Edit, Delete, Save, Cancel, Discount, LocalOffer, Payments, TrendingDown } from '@mui/icons-material';
import { RemiseType, RemiseTypeCreatePayload } from '../types';
import { getRemiseTypes, createRemiseType, updateRemiseType, deleteRemiseType } from '../services/remiseTypeService';

interface RemiseTypeManagementProps {
  boutiqueId: string;
}

const RemiseTypeManagement: React.FC<RemiseTypeManagementProps> = ({ boutiqueId }) => {
  const [remiseTypes, setRemiseTypes] = useState<RemiseType[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRemiseTypeId, setEditingRemiseTypeId] = useState<number | null>(null);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const [remiseTypeForm, setRemiseTypeForm] = useState<RemiseTypeCreatePayload>({
    duree_plan_paiement_number: '',
    duree_plan_paiement_unit: '',
    type_remise: '',
    nombre_tranches: '',
    pourcentage_remise: '',
    montant_max_remise: '',
    boutique: boutiqueId,
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchRemiseTypes = async () => {
      if (!boutiqueId) {
        setError('No boutique ID provided.');
        return;
      }
      setLoading(true);
      try {
        const remiseTypesData = await getRemiseTypes(boutiqueId);
        setRemiseTypes(remiseTypesData);
        if (remiseTypesData.length === 0) {
          setError('No remise types found for this boutique.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch remise types. Please try again.');
        console.error('Fetch remise types error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRemiseTypes();
  }, [boutiqueId]);

  const handleFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target as HTMLInputElement | { name: string; value: string };
    setRemiseTypeForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!remiseTypeForm.duree_plan_paiement_number || Number(remiseTypeForm.duree_plan_paiement_number) <= 0) {
      errors.duree_plan_paiement_number = 'Durée doit être un nombre positif';
    }
    if (!remiseTypeForm.duree_plan_paiement_unit) {
      errors.duree_plan_paiement_unit = 'Unité de durée est requise';
    }
    if (!remiseTypeForm.type_remise) {
      errors.type_remise = 'Type de remise est requis';
    }
    if (remiseTypeForm.type_remise === 'tranches' && (!remiseTypeForm.nombre_tranches || Number(remiseTypeForm.nombre_tranches) <= 0)) {
      errors.nombre_tranches = 'Nombre de tranches doit être un entier positif pour le type tranches';
    }
    if (!remiseTypeForm.pourcentage_remise || Number(remiseTypeForm.pourcentage_remise) <= 0) {
      errors.pourcentage_remise = 'Pourcentage de remise doit être supérieur à 0';
    }
    if (!remiseTypeForm.boutique) {
      errors.boutique = 'Boutique ID est requis';
    }
    return errors;
  };

  const handleOpenDialog = () => {
    setEditingRemiseTypeId(null);
    setRemiseTypeForm({
      duree_plan_paiement_number: '',
      duree_plan_paiement_unit: '',
      type_remise: '',
      nombre_tranches: '',
      pourcentage_remise: '',
      montant_max_remise: '',
      boutique: boutiqueId,
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const parseDureePlanPaiement = (duree: string): { number: string; unit: string } => {
    const match = duree.match(/^(\d+)\s*(jours?|mois|années?)$/i);
    if (match) {
      return { number: match[1], unit: match[2].toLowerCase() };
    }
    return { number: '', unit: '' };
  };

  const handleEditRemiseType = (remiseType: RemiseType) => {
    const { number, unit } = parseDureePlanPaiement(remiseType.duree_plan_paiement);
    setEditingRemiseTypeId(remiseType.id);
    setRemiseTypeForm({
      duree_plan_paiement_number: number,
      duree_plan_paiement_unit: unit,
      type_remise: remiseType.type_remise,
      nombre_tranches: remiseType.nombre_tranches?.toString() || '',
      pourcentage_remise: remiseType.pourcentage_remise.toString(),
      montant_max_remise: remiseType.montant_max_remise?.toString() || '',
      boutique: remiseType.boutique?.toString() || boutiqueId,
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        duree_plan_paiement: `${remiseTypeForm.duree_plan_paiement_number} ${remiseTypeForm.duree_plan_paiement_unit}`,
        type_remise: remiseTypeForm.type_remise,
        nombre_tranches: remiseTypeForm.type_remise === 'tranches' ? Number(remiseTypeForm.nombre_tranches) : null,
        pourcentage_remise: Number(remiseTypeForm.pourcentage_remise),
        montant_max_remise: remiseTypeForm.montant_max_remise ? Number(remiseTypeForm.montant_max_remise) : null,
        boutique: Number(remiseTypeForm.boutique),
      };
      console.log('Submitting payload:', payload);
      let updatedRemiseType: RemiseType;
      if (editingRemiseTypeId) {
        updatedRemiseType = await updateRemiseType(editingRemiseTypeId, payload);
        setRemiseTypes(remiseTypes.map((rt) => (rt.id === editingRemiseTypeId ? updatedRemiseType : rt)));
      } else {
        const newRemiseType = await createRemiseType(payload);
        setRemiseTypes([...remiseTypes, newRemiseType]);
      }
      setRemiseTypeForm({
        duree_plan_paiement_number: '',
        duree_plan_paiement_unit: '',
        type_remise: '',
        nombre_tranches: '',
        pourcentage_remise: '',
        montant_max_remise: '',
        boutique: boutiqueId,
      });
      setOpenDialog(false);
      setError('');
      setFormErrors({});
    } catch (err: any) {
      const errorMessage = err.message || 'Échec de l\'enregistrement du type de remise. Veuillez vérifier vos saisies.';
      setError(errorMessage);
      console.error('Remise type submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirmDelete = (id: number) => {
    setConfirmDeleteDialog({ open: true, id });
  };

  const handleCloseConfirmDelete = () => {
    setConfirmDeleteDialog({ open: false, id: null });
  };

  const handleDeleteRemiseType = async (id: number) => {
    setLoading(true);
    try {
      await deleteRemiseType(id, boutiqueId);
      setRemiseTypes(remiseTypes.filter((rt) => rt.id !== id));
      setError('');
    } catch (err: any) {
      const errorMessage = err.message || 'Échec de la suppression du type de remise. Veuillez vérifier votre association avec la boutique.';
      setError(errorMessage);
      console.error('Delete remise type error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteDialog.id !== null) {
      handleDeleteRemiseType(confirmDeleteDialog.id);
    }
    handleCloseConfirmDelete();
  };

  // Get card color based on percentage
  const getCardGradient = (percentage: number) => {
    if (percentage > 50) return 'linear-gradient(135deg, #d81b60 0%, #8e24aa 100%)';
    if (percentage > 25) return 'linear-gradient(135deg, #ec407a 0%, #ab47bc 100%)';
    return 'linear-gradient(135deg, #f06292 0%, #ba68c8 100%)';
  };

  // Get percentage badge style based on percentage
  const getPercentageBadgeStyle = (percentage: number) => {
    if (percentage > 50) return { background: '#d81b60', color: 'white' };
    if (percentage > 25) return { background: '#ec407a', color: 'white' };
    return { background: '#f06292', color: 'white' };
  };

  return (
    <Box p={4} sx={{ 
      background: 'linear-gradient(135deg, #fff0f7 0%, #f3e5f5 100%)',
      minHeight: '100vh'
    }}>
      <Box sx={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(186, 104, 200, 0.15)',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '8px',
          background: 'linear-gradient(90deg, #ec407a 0%, #ab47bc 100%)'
        }
      }}>
        <Typography variant="h4" fontWeight="bold" mb={4} sx={{
          color: '#9c27b0',
          display: 'flex',
          alignItems: 'center',
        }}>
          <LocalOffer sx={{ mr: 2, fontSize: 40, color: '#ec407a' }} />
          Gestion des Types de Remise
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ 
            mb: 3, 
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            {error}
          </Alert>
        )}
        
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress sx={{ color: '#ec407a' }} />
          </Box>
        )}

        <Box mb={4}>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={4}
            sx={{
              background: 'linear-gradient(135deg, #f8bbd0 0%, #e1bee7 100%)',
              padding: '20px 24px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(186, 104, 200, 0.12)'
            }}
          >
            <Box display="flex" alignItems="center">
              <Discount sx={{ fontSize: 36, color: '#c2185b', mr: 2 }} />
              <Typography variant="h5" fontWeight="600" sx={{ color: '#7b1fa2' }}>
                Liste des Types de Remise
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenDialog}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #ec407a 0%, #ab47bc 100%)',
                color: 'white',
                borderRadius: '30px',
                padding: '12px 24px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(236, 64, 122, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(236, 64, 122, 0.4)',
                  background: 'linear-gradient(135deg, #f06292 0%, #ba68c8 100%)'
                }
              }}
            >
              Ajouter un Type
            </Button>
          </Box>

          <Dialog 
            open={openDialog} 
            onClose={() => setOpenDialog(false)}
            PaperProps={{
              sx: {
                borderRadius: '20px',
                width: '100%',
                maxWidth: '600px',
                boxShadow: '0 10px 40px rgba(186, 104, 200, 0.25)',
                overflow: 'hidden'
              }
            }}
          >
            <DialogTitle sx={{
              background: 'linear-gradient(135deg, #ec407a 0%, #ab47bc 100%)',
              color: 'white',
              fontWeight: '600',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Discount sx={{ mr: 1.5, fontSize: 28 }} />
              {editingRemiseTypeId ? 'Modifier Type de Remise' : 'Nouveau Type de Remise'}
            </DialogTitle>
            <DialogContent sx={{ padding: '24px' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  margin="dense"
                  label="Durée"
                  name="duree_plan_paiement_number"
                  type="number"
                  value={remiseTypeForm.duree_plan_paiement_number}
                  onChange={handleFormChange}
                  required
                  error={!!formErrors.duree_plan_paiement_number}
                  helperText={formErrors.duree_plan_paiement_number}
                  inputProps={{ min: "1" }}
                  sx={{ 
                    mb: 3,
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#ab47bc',
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#ab47bc'
                    }
                  }}
                  variant="outlined"
                />
                <FormControl fullWidth margin="dense" error={!!formErrors.duree_plan_paiement_unit} sx={{ 
                  mb: 3,
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#ab47bc',
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#ab47bc'
                  }
                }}>
                  <InputLabel>Unité</InputLabel>
                  <Select
                    name="duree_plan_paiement_unit"
                    value={remiseTypeForm.duree_plan_paiement_unit}
                    onChange={handleFormChange}
                    label="Unité"
                    required
                    variant="outlined"
                  >
                    <MenuItem value="">Sélectionner une unité</MenuItem>
                    <MenuItem value="jours">Jours</MenuItem>
                    <MenuItem value="mois">Mois</MenuItem>
                    <MenuItem value="années">Années</MenuItem>
                  </Select>
                  {formErrors.duree_plan_paiement_unit && (
                    <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                      {formErrors.duree_plan_paiement_unit}
                    </Typography>
                  )}
                </FormControl>
              </Box>
              <FormControl fullWidth margin="dense" error={!!formErrors.type_remise} sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#4caf50',
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#4caf50'
                }
              }}>
                <InputLabel>Type de Remise</InputLabel>
                <Select
                  name="type_remise"
                  value={remiseTypeForm.type_remise}
                  onChange={handleFormChange}
                  label="Type de Remise"
                  required
                  variant="outlined"
                >
                  <MenuItem value="">Sélectionner un Type</MenuItem>
                  <MenuItem value="tranches">Remise par tranches</MenuItem>
                  <MenuItem value="fin_paiement">Remise à la fin de paiement</MenuItem>
                </Select>
                {formErrors.type_remise && (
                  <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                    {formErrors.type_remise}
                  </Typography>
                )}
              </FormControl>
              <TextField
                fullWidth
                margin="dense"
                label="Nombre de tranches"
                name="nombre_tranches"
                type="number"
                value={remiseTypeForm.nombre_tranches}
                onChange={handleFormChange}
                disabled={remiseTypeForm.type_remise !== 'tranches'}
                required={remiseTypeForm.type_remise === 'tranches'}
                error={!!formErrors.nombre_tranches}
                helperText={formErrors.nombre_tranches}
                inputProps={{ min: "1" }}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#4caf50',
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#4caf50'
                  }
                }}
                variant="outlined"
              />
              <TextField
                fullWidth
                margin="dense"
                label="Pourcentage de remise (%)"
                name="pourcentage_remise"
                type="number"
                value={remiseTypeForm.pourcentage_remise}
                onChange={handleFormChange}
                required
                inputProps={{ step: "0.01", min: "0.01", max: "100" }}
                error={!!formErrors.pourcentage_remise}
                helperText={formErrors.pourcentage_remise}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#4caf50',
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#4caf50'
                  }
                }}
                variant="outlined"
              />
              <TextField
                fullWidth
                margin="dense"
                label="Montant maximal de remise"
                name="montant_max_remise"
                type="number"
                value={remiseTypeForm.montant_max_remise}
                onChange={handleFormChange}
                inputProps={{ step: "0.01", min: "0" }}
                sx={{ 
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#4caf50',
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#4caf50'
                  }
                }}
                variant="outlined"
              />
            </DialogContent>
            <DialogActions sx={{ 
              padding: '20px 24px', 
              borderTop: '1px solid #f3e5f5',
              background: '#fcf9fd' 
            }}>
              <Button 
                onClick={() => setOpenDialog(false)} 
                startIcon={<Cancel />}
                sx={{
                  color: '#616161',
                  borderRadius: '30px',
                  padding: '8px 16px',
                  '&:hover': {
                    background: 'rgba(0,0,0,0.05)'
                  }
                }}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSubmit} 
                variant="contained" 
                startIcon={<Save />} 
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #ec407a 0%, #ab47bc 100%)',
                  color: 'white',
                  borderRadius: '30px',
                  padding: '8px 24px',
                  fontWeight: '600',
                  boxShadow: '0 2px 8px rgba(236, 64, 122, 0.3)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(236, 64, 122, 0.4)',
                    background: 'linear-gradient(135deg, #f06292 0%, #ba68c8 100%)'
                  }
                }}
              >
                {editingRemiseTypeId ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog 
            open={confirmDeleteDialog.open} 
            onClose={handleCloseConfirmDelete}
            PaperProps={{
              sx: {
                borderRadius: '20px',
                width: '100%',
                maxWidth: '500px',
                overflow: 'hidden'
              }
            }}
          >
            <DialogTitle sx={{
              background: '#f44336',
              color: 'white',
              fontWeight: 'bold',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Delete sx={{ mr: 1.5 }} />
              Confirmation de suppression
            </DialogTitle>
            <DialogContent sx={{ padding: '24px' }}>
              <Typography>Êtes-vous sûr de vouloir supprimer ce type de remise ? Cette action est irréversible.</Typography>
            </DialogContent>
            <DialogActions sx={{ 
              padding: '16px 24px', 
              borderTop: '1px solid #ffebee',
              background: '#fff5f5'
            }}>
              <Button 
                onClick={handleCloseConfirmDelete} 
                startIcon={<Cancel />}
                sx={{
                  color: '#616161',
                  borderRadius: '30px',
                  padding: '8px 16px',
                  '&:hover': {
                    background: 'rgba(0,0,0,0.05)'
                  }
                }}
              >
                Non
              </Button>
              <Button 
                onClick={handleConfirmDelete} 
                variant="contained" 
                color="error" 
                startIcon={<Delete />}
                sx={{
                  background: 'linear-gradient(135deg, #f44336 0%, #c62828 100%)',
                  color: 'white',
                  borderRadius: '30px',
                  padding: '8px 24px',
                  fontWeight: '600',
                  boxShadow: '0 2px 8px rgba(244, 67, 54, 0.2)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                    background: 'linear-gradient(135deg, #ff5252 0%, #f44336 100%)'
                  }
                }}
              >
                Oui, supprimer
              </Button>
            </DialogActions>
          </Dialog>

          <Grid container spacing={3}>
            {!loading && remiseTypes.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{
                  background: '#fce4ec',
                  borderRadius: '16px',
                  padding: '32px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <LocalOffer sx={{ fontSize: 48, color: '#ec407a', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#ad1457' }} mb={1}>
                    Aucun type de remise trouvé
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#c2185b' }}>
                    Commencez par ajouter un nouveau type de remise pour votre boutique.
                  </Typography>
                </Box>
              </Grid>
            )}
            {remiseTypes.map((remiseType) => {
              const percentage = remiseType.pourcentage_remise;
              return (
                <Grid item xs={12} sm={6} md={4} key={remiseType.id}>
                  <Card sx={{ 
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 28px rgba(0, 150, 136, 0.18)'
                    }
                  }}>
                    <Box sx={{
                      background: getCardGradient(percentage),
                      padding: '20px',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                          {remiseType.duree_plan_paiement}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                        }}>
                          {remiseType.type_remise === 'tranches' ? (
                            <Payments sx={{ fontSize: 18, mr: 0.5 }} />
                          ) : (
                            <TrendingDown sx={{ fontSize: 18, mr: 0.5 }} />
                          )}
                          <Typography variant="body2" sx={{ fontWeight: '500' }}>
                            {remiseType.type_remise_display}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ 
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                      }}>
                        <Typography variant="h6" fontWeight="bold">
                          {percentage}%
                        </Typography>
                      </Box>
                    </Box>
                    <CardContent sx={{ padding: '24px' }}>
                      {remiseType.nombre_tranches && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2,
                          padding: '8px 16px',
                          background: '#f3e5f5',
                          borderRadius: '8px'
                        }}>
                          <Typography variant="body2" sx={{ color: '#7b1fa2', mr: 1, fontWeight: '500' }}>
                            Nombre de tranches:
                          </Typography>
                          <Typography variant="body1" fontWeight="600" sx={{ color: '#c2185b' }}>
                            {remiseType.nombre_tranches}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#616161' }}>
                          Pourcentage de remise:
                        </Typography>
                        <Box sx={{ 
                          padding: '6px 12px',
                          borderRadius: '20px',
                          ...getPercentageBadgeStyle(percentage),
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <Typography variant="body2" fontWeight="600">
                            {percentage}%
                          </Typography>
                        </Box>
                      </Box>
                      {remiseType.montant_max_remise && (
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Typography variant="body2" sx={{ color: '#616161' }}>
                            Montant max remise:
                          </Typography>
                          <Box sx={{ 
                            padding: '6px 12px',
                            borderRadius: '8px',
                            background: '#f5f5f5',
                          }}>
                            <Typography variant="body2" fontWeight="600" sx={{ color: '#424242' }}>
                              {remiseType.montant_max_remise} DH
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                    <CardActions sx={{ 
                      justifyContent: 'flex-end', 
                      padding: '12px 16px',
                      borderTop: '1px solid #f8bbd0'
                    }}>
                      <IconButton 
                        onClick={() => handleEditRemiseType(remiseType)} 
                        disabled={loading}
                        sx={{
                          color: '#ab47bc',
                          background: 'rgba(171, 71, 188, 0.08)',
                          marginRight: '8px',
                          '&:hover': {
                            background: 'rgba(171, 71, 188, 0.15)'
                          }
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleOpenConfirmDelete(remiseType.id)} 
                        disabled={loading}
                        sx={{
                          color: '#f44336',
                          background: 'rgba(244, 67, 54, 0.08)',
                          '&:hover': {
                            background: 'rgba(244, 67, 54, 0.15)'
                          }
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default RemiseTypeManagement;