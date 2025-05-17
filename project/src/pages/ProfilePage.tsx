
import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useAuthStore } from '../components/Store/authStore';
import { toast } from 'react-hot-toast';
import { Camera, Loader2 } from 'lucide-react';

import api from '../axiosInstance';

interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  role: string;
  avatar?: string;
}

const ProfilePage = () => {
  const { user, setTokens } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gérer les changements dans le formulaire
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Gérer la sélection d'une nouvelle image
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image valide.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 5 Mo.');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Déclencher l'input file
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Uploader l'image de profil avec Axios
  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      toast.error('Veuillez sélectionner une image.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    try {
      const response = await api.post('/users/auth/update-avatar/', formData, {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setTokens({
        user: { ...user!, avatar: response.data.avatar_url },
        access_token: useAuthStore.getState().accessToken!,
        refresh_token: useAuthStore.getState().refreshToken!,
      });
      setAvatarFile(null);
      toast.success('Image de profil mise à jour !');
    } catch (error: any) {
      console.error('Erreur lors de l\'upload de l\'avatar:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'upload.');
    } finally {
      setIsUploading(false);
    }
  };

  // Soumettre les modifications du profil avec Axios
  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.email.includes('@')) {
      toast.error('Veuillez entrer un email valide.');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await api.put('/users/auth/update-profile/', formData, {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      setTokens({
        user: { ...user!, ...response.data },
        access_token: useAuthStore.getState().accessToken!,
        refresh_token: useAuthStore.getState().refreshToken!,
      });
      setIsEditing(false);
      toast.success('Profil mis à jour !');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Annuler les modifications
  const handleCancel = () => {
    setFormData({
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
    });
    setAvatarFile(null);
    setAvatarPreview(user?.avatar || null);
    setIsEditing(false);
  };

  if (!user) {
    return <div className="text-center py-12 text-gray-600">Chargement du profil...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Mon Profil</h1>

        {/* Section Image de Profil */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
          <img
  src={avatarPreview ? `http://localhost:8000/${avatarPreview}` : '/default-avatar.png'}
  alt={user.nom || 'Utilisateur'}
  className="h-24 w-24 rounded-full object-cover ring-2 ring-blue-500 transition-transform group-hover:scale-105"
/>
            <button
              onClick={triggerFileInput}
              className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Changer l'image de profil"
              disabled={isUploading}
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
          {avatarFile && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleAvatarUpload}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Upload...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                disabled={isUploading}
              >
                Annuler
              </button>
            </div>
          )}
        </div>

        {/* Informations Personnelles */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations Personnelles</h2>
          {isEditing ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isUpdating}
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <p className="text-gray-900">{user.nom || 'Non fourni'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <p className="text-gray-900">{user.prenom || 'Non fourni'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{user.email || 'Non fourni'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <p className="text-gray-900">{user.telephone || 'Non fourni'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Modifier
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;