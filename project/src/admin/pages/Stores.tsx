import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, Eye, Check, X, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAllBoutiques, createBoutique, deleteBoutique, getBoutiquesall, approveBoutique, rejectBoutique } from '../../services/boutiqueService';
import { getCategories } from '../../services/categorieService';
import { Boutique, CategoryBoutique } from '../../types';
import { useAuthStore } from '../../components/Store/authStore';

// Interface pour la pagination
interface Pagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
}

// Interface pour le formulaire d'ajout de boutique
interface NewBoutique {
  nom: string;
  description: string;
  adresse: string;
  telephone: string;
  email: string;
  category_boutique: string;
  logo: File | null;
  image: File | null;
}

const Stores: React.FC = () => {
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [filteredBoutiques, setFilteredBoutiques] = useState<Boutique[]>([]);
  const [categories, setCategories] = useState<CategoryBoutique[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 4,
    totalPages: 4,
    pageSize: 10,
    totalCount: 0,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBoutique, setNewBoutique] = useState<NewBoutique>({
    nom: '',
    description: '',
    adresse: '',
    telephone: '',
    email: '',
    category_boutique: '',
    logo: null,
    image: null,
  });
  const { user } = useAuthStore();

  // Met à jour la pagination
  const updatePagination = useCallback((boutiques: Boutique[]) => {
    const totalCount = boutiques.length;
    const totalPages = Math.ceil(totalCount / pagination.pageSize);
    setPagination((prev) => ({
      ...prev,
      totalCount,
      totalPages: totalPages || 1,
      currentPage: Math.min(prev.currentPage, totalPages || 1),
    }));
  }, [pagination.pageSize]);

  // Récupère les boutiques
  const fetchBoutiques = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const boutiques = await getBoutiquesall();
      console.log('Fetched boutiques:', boutiques);
      setBoutiques(boutiques);
      setFilteredBoutiques(boutiques);
      updatePagination(boutiques);
    } catch (err: any) {
      const errorMessage = err.message || 'Échec de la récupération des boutiques';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Erreur lors de la récupération des boutiques:', err);
    } finally {
      setLoading(false);
    }
  }, [updatePagination]);

  // Récupère les catégories
  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des catégories:', err);
      toast.error('Échec de la récupération des catégories');
    }
  }, []);

  // Charge les données au montage
  useEffect(() => {
    fetchBoutiques();
    fetchCategories();
  }, [fetchBoutiques, fetchCategories]);

  // Filtre les boutiques selon le terme de recherche
  useEffect(() => {
    const result = searchTerm
      ? boutiques.filter(
          (boutique) =>
            boutique.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            boutique.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            boutique.telephone?.includes(searchTerm)
        )
      : boutiques;
    setFilteredBoutiques(result);
    updatePagination(result);
  }, [searchTerm, boutiques, updatePagination]);

  // Approuver une boutique
  const handleApprove = async (boutiqueId: number) => {
    try {
      const updatedBoutique = await approveBoutique(boutiqueId);
      const updatedBoutiques = boutiques.map((b) =>
        b.id === boutiqueId ? updatedBoutique : b
      );
      setBoutiques(updatedBoutiques);
      setFilteredBoutiques(updatedBoutiques);
      updatePagination(updatedBoutiques);
      toast.success('Boutique approuvée avec succès');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Échec de l\'approbation de la boutique';
      toast.error(errorMessage);
      console.error('Erreur lors de l\'approbation:', err);
    }
  };

  // Rejeter une boutique
  const handleReject = async (boutiqueId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir rejeter cette boutique ?')) {
      try {
        const updatedBoutique = await rejectBoutique(boutiqueId);
        const updatedBoutiques = boutiques.map((b) =>
          b.id === boutiqueId ? updatedBoutique : b
        );
        setBoutiques(updatedBoutiques);
        setFilteredBoutiques(updatedBoutiques);
        updatePagination(updatedBoutiques);
        toast.success('Boutique rejetée avec succès');
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 'Échec du rejet de la boutique';
        toast.error(errorMessage);
        console.error('Erreur lors du rejet:', err);
      }
    }
  };

  // Supprimer une boutique
  const handleDelete = async (boutiqueId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette boutique ?')) {
      try {
        await deleteBoutique(boutiqueId);
        const updatedBoutiques = boutiques.filter((b) => b.id !== boutiqueId);
        setBoutiques(updatedBoutiques);
        setFilteredBoutiques(updatedBoutiques);
        updatePagination(updatedBoutiques);
        toast.success('Boutique supprimée avec succès');
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 'Échec de la suppression de la boutique';
        toast.error(errorMessage);
        console.error('Erreur lors de la suppression:', err);
      }
    }
  };

  // Ajouter une boutique
  const handleAddBoutique = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoutique.nom || !newBoutique.category_boutique) {
      toast.error('Le nom et la catégorie sont requis');
      return;
    }
    if (newBoutique.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newBoutique.email)) {
      toast.error('Format d\'email invalide');
      return;
    }
    const formData = new FormData();
    Object.entries(newBoutique).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value as string | Blob);
      }
    });
    if (user?.id) {
      formData.append('marchand', user.id.toString());
    }
    try {
      const boutique = await createBoutique(formData);
      const updatedBoutiques = [...boutiques, boutique];
      setBoutiques(updatedBoutiques);
      setFilteredBoutiques(updatedBoutiques);
      updatePagination(updatedBoutiques);
      setShowAddModal(false);
      setNewBoutique({
        nom: '',
        description: '',
        adresse: '',
        telephone: '',
        email: '',
        category_boutique: '',
        logo: null,
        image: null,
      });
      toast.success('Boutique créée avec succès');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Échec de la création de la boutique';
      toast.error(errorMessage);
      console.error('Erreur lors de la création:', err);
    }
  };

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
    }
  };

  // Rendu des boutons de pagination
  const renderPageButtons = () => {
    const { currentPage, totalPages } = pagination;
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
      <button
        key={page}
        onClick={() => handlePageChange(page)}
        className={`px-4 py-2 border rounded-lg ${
          currentPage === page ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
        }`}
        aria-label={`Page ${page}`}
      >
        {page}
      </button>
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" aria-label="Chargement"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
        <button
          onClick={fetchBoutiques}
          className="ml-4 px-4 py-2 bg-red-100 rounded-lg hover:bg-red-200"
          aria-label="Réessayer"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Boutiques</h1>
        <button
          className="btn btn-primary flex items-center"
          onClick={() => setShowAddModal(true)}
          aria-label="Ajouter une boutique"
        >
          <Plus className="mr-2" /> Ajouter Boutique
        </button>
      </div>

      {/* Modal d'ajout de boutique */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Ajouter une Nouvelle Boutique</h2>
            <form onSubmit={handleAddBoutique}>
              <div className="mb-4">
                <label htmlFor="nom" className="block text-sm font-medium">Nom</label>
                <input
                  id="nom"
                  type="text"
                  value={newBoutique.nom}
                  onChange={(e) => setNewBoutique({ ...newBoutique, nom: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                  aria-required="true"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium">Description</label>
                <textarea
                  id="description"
                  value={newBoutique.description}
                  onChange={(e) => setNewBoutique({ ...newBoutique, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="adresse" className="block text-sm font-medium">Adresse</label>
                <input
                  id="adresse"
                  type="text"
                  value={newBoutique.adresse}
                  onChange={(e) => setNewBoutique({ ...newBoutique, adresse: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="telephone" className="block text-sm font-medium">Téléphone</label>
                <input
                  id="telephone"
                  type="text"
                  value={newBoutique.telephone}
                  onChange={(e) => setNewBoutique({ ...newBoutique, telephone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium">Email</label>
                <input
                  id="email"
                  type="email"
                  value={newBoutique.email}
                  onChange={(e) => setNewBoutique({ ...newBoutique, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="category_boutique" className="block text-sm font-medium">Catégorie</label>
                <select
                  id="category_boutique"
                  value={newBoutique.category_boutique}
                  onChange={(e) => setNewBoutique({ ...newBoutique, category_boutique: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                  aria-required="true"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="logo" className="block text-sm font-medium">Logo</label>
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewBoutique({ ...newBoutique, logo: e.target.files?.[0] || null })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="image" className="block text-sm font-medium">Image</label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewBoutique({ ...newBoutique, image: e.target.files?.[0] || null })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="mr-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  aria-label="Annuler"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  aria-label="Créer la boutique"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des boutiques..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Rechercher des boutiques"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-3 px-4">Nom</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Marchand</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBoutiques
                .slice(
                  (pagination.currentPage - 1) * pagination.pageSize,
                  pagination.currentPage * pagination.pageSize
                )
                .map((boutique) => (
                  <tr key={boutique.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {boutique.logo && (
                          <img
                            src={`http://localhost:8000${boutique.logo}`}
                            alt={boutique.nom || 'Logo de la boutique'}
                            className="w-10 h-10 rounded-full mr-3"
                            onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                          />
                        )}
                        <div>
                          <div className="font-medium">{boutique.nom || 'Boutique sans nom'}</div>
                          <div className="text-sm text-gray-500">{boutique.email || 'Aucun email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{boutique.category_boutique?.nom || 'N/A'}</td>
                    <td className="py-3 px-4">{boutique.marchand?.user?.nom || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          boutique.is_approved === null
                            ? 'bg-yellow-100 text-yellow-600'
                            : boutique.is_approved
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {boutique.is_approved === null
                          ? 'En attente'
                          : boutique.is_approved
                          ? 'Approuvé'
                          : 'Rejeté'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          className="p-1 text-blue-500 hover:text-blue-700"
                          title="Voir"
                          aria-label={`Voir la boutique ${boutique.nom}`}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="p-1 text-indigo-500 hover:text-indigo-700"
                          title="Mettre à jour"
                          aria-label={`Mettre à jour la boutique ${boutique.nom}`}
                        >
                          <RefreshCw size={18} />
                        </button>
                        {boutique.is_approved === null && (
                          <>
                            <button
                              className="p-1 text-green-500 hover:text-green-700"
                              onClick={() => handleApprove(boutique.id)}
                              title="Approuver"
                              aria-label={`Approuver la boutique ${boutique.nom}`}
                            >
                              <Check size={18} />
                            </button>
                            <button
                              className="p-1 text-red-500 hover:text-red-700"
                              onClick={() => handleReject(boutique.id)}
                              title="Rejeter"
                              aria-label={`Rejeter la boutique ${boutique.nom}`}
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                        <button
                          className="p-1 text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(boutique.id)}
                          title="Supprimer"
                          aria-label={`Supprimer la boutique ${boutique.nom}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {filteredBoutiques.length === 0 && (
          <div className="text-center py-8 text-gray-500">Aucune boutique trouvée</div>
        )}

        {filteredBoutiques.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div>
              Affichage de {(pagination.currentPage - 1) * pagination.pageSize + 1} à{' '}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} sur{' '}
              {pagination.totalCount} boutiques
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                aria-label="Page précédente"
              >
                Précédent
              </button>
              {renderPageButtons()}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                aria-label="Page suivante"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stores;