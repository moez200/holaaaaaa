
import { useState, useEffect, useRef } from 'react';
import { Search, Filter, Plus, Trash2, Edit, X, Image as ImageIcon, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import { createCategory, deleteCategory, getCategories, updateCategory } from '../../services/categorieService';
import { CategoryBoutique } from '../../types';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryBoutique[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<CategoryBoutique | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<Partial<CategoryBoutique>>({
    nom: '',
    image: null,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await getCategories({ cacheBust: Date.now() });
        console.log('Fetched categories:', response);
        setCategories(response);
      } catch (error) {
        toast.error('Failed to load categories');
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAddCategory = async () => {
    if (!newCategory.nom?.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const categoryData: Partial<CategoryBoutique> & { imageFile?: File } = {
        nom: newCategory.nom,
        imageFile: imageFile || undefined,
      };

      const response = await createCategory(categoryData);
      setCategories([...categories, response]);
      toast.success('Category added successfully!');
      resetForm();
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error('Failed to add category');
      console.error('Error adding category:', error);
    }
  };

  const handleEditCategory = (category: CategoryBoutique) => {
    setEditMode(true);
    setCurrentCategory(category);
    setNewCategory({
      nom: category.nom,
      image: category.image || null,
    });
    setPreviewImage(category.image || null);
    setImageFile(null);
    setIsAddModalOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!currentCategory) return;

    try {
      const categoryData: Partial<CategoryBoutique> & { imageFile?: File } = {
        nom: newCategory.nom,
        imageFile: imageFile || undefined,
      };

      const response = await updateCategory(currentCategory.id, categoryData);
      setCategories(categories.map(cat =>
        cat.id === currentCategory.id ? response : cat
      ));
      toast.success('Category updated successfully!');
      resetForm();
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error('Failed to update category');
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteClick = (category: CategoryBoutique) => {
    setCurrentCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!currentCategory) return;

    try {
      await deleteCategory(currentCategory.id);
      setCategories(categories.filter(cat => cat.id !== currentCategory.id));
      toast.success('Category deleted successfully!');
      resetForm();
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete category');
      console.error('Error deleting category:', error);
    }
  };

  const resetForm = () => {
    setNewCategory({
      nom: '',
      image: null,
    });
    setCurrentCategory(null);
    setEditMode(false);
    setPreviewImage(null);
    setImageFile(null);
  };

  const filteredCategories = categories.filter(category =>
    category.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-6 p-4 md:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.h2
          variants={slideUp}
          className="text-2xl md:text-3xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          Shop Categories
        </motion.h2>
        <motion.button
          variants={slideUp}
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Plus size={18} className="mr-2" />
          Add New Category
        </motion.button>
      </div>

      <motion.div
        variants={slideUp}
        className="bg-white rounded-xl p-5 shadow-lg border-gray-100 space-y-4 backdrop-blur-sm bg-opacity-90"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="px-5 py-3 border border-gray-200 rounded-xl flex items-center hover:bg-gray-50 transition-colors duration-200 shadow-sm">
              <Filter size={16} className="mr-2 text-gray-500" />
              <span className="font-medium">Filters</span>
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={slideUp}
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {[
          { title: 'Total Categories', value: categories.length.toString(), icon: 'layers', color: 'bg-indigo-100 text-indigo-600', bg: 'from-indigo-50 to-indigo-100' },
          { title: 'Total Products', value: '0', icon: 'package', color: 'bg-emerald-100 text-emerald-600', bg: 'from-emerald-50 to-emerald-100' },
          { title: 'Avg. Products per Category', value: '0', icon: 'bar-chart', color: 'bg-amber-100 text-amber-600', bg: 'from-amber-50 to-amber-100' },
        ].map((stat, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${stat.bg} rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-300`}
          >
            <div className={`w-14 h-14 rounded-xl ${stat.color} flex items-center justify-center mb-4 shadow-inner`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {stat.icon === 'layers' && <><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></>}
                {stat.icon === 'package' && <><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></>}
                {stat.icon === 'bar-chart' && <><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></>}
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.title}</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        variants={slideUp}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center py-8">
            <div className="flex items-center">
              <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-2 text-gray-600">Loading categories...</span>
            </div>
          </div>
        ) : filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <motion.div
              key={category.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.nom}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      console.error(`Failed to load image for ${category.nom}: ${category.image}`);
                      e.currentTarget.src = 'https://placehold.co/150x150';
                    }}
                    onLoad={() => console.log(`Successfully loaded image for ${category.nom}: ${category.image}`)}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <ImageIcon size={48} className="text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 transition-colors"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(category)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{category.nom}</h3>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <ImageIcon size={24} className="text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-700 mt-3">No categories found</h4>
            <p className="text-sm text-gray-500 mt-1">Create your first category to get started</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Add Category
            </button>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {editMode ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsAddModalOpen(false);
                      resetForm();
                    }}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Image
                    </label>
                    <div
                      onClick={triggerFileInput}
                      className={`w-full h-40 rounded-xl border-2 border-dashed ${previewImage ? 'border-transparent' : 'border-gray-300 hover:border-indigo-400'} overflow-hidden cursor-pointer transition-all duration-200 flex items-center justify-center`}
                    >
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Click to upload an image</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    {previewImage && (
                      <button
                        onClick={() => {
                          setPreviewImage(null);
                          setImageFile(null);
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-700 flex items-center"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Remove image
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Enter category name"
                      value={newCategory.nom || ''}
                      onChange={(e) => setNewCategory({ ...newCategory, nom: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      onClick={() => {
                        setIsAddModalOpen(false);
                        resetForm();
                      }}
                      className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editMode ? handleUpdateCategory : handleAddCategory}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      {editMode ? 'Update' : 'Add'} Category
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Confirm Deletion
                  </h3>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-5">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Warning: This action cannot be undone
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>
                            Are you sure you want to delete the category "{currentCategory?.nom}"?
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteCategory}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl text-sm font-medium hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete Permanently
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Categories;