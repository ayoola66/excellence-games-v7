'use client'

import { useState, useEffect, Fragment } from 'react';
import { strapiApi } from '@/lib/strapiApi';
import { Category } from '@/types';
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import compatToast from '@/lib/notificationManager';
import { Dialog, Transition } from '@headlessui/react';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

const CategoryCard = ({ category, onEdit, onDelete }: CategoryCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:border-blue-300 transition-colors">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-gray-900">{category.attributes.name}</h3>
          <div className="flex space-x-1">
            <button
              onClick={() => onEdit(category)}
              className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(category.id)}
              className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.attributes.description || 'No description'}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500">
            <QuestionMarkCircleIcon className="h-4 w-4 mr-1" />
            <span>{category.attributes.questionCount || 0} questions</span>
          </div>
          
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            category.attributes.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {category.attributes.status || 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
};

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: any) => void;
  category: Category | null;
}

const CategoryDialog = ({ isOpen, onClose, onSave, category }: CategoryDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  
  useEffect(() => {
    if (category) {
      setName(category.attributes.name || '');
      setDescription(category.attributes.description || '');
      setStatus(category.attributes.status || 'active');
    } else {
      setName('');
      setDescription('');
      setStatus('active');
    }
  }, [category]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      compatToast.error('Category name is required');
      return;
    }
    
    onSave({
      name,
      description,
      status
    });
  };
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  {category ? 'Edit Category' : 'Add New Category'}
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </Dialog.Title>
                
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      {category ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await strapiApi.get('/api/categories?populate=*');
      setCategories(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await strapiApi.deleteCategory(id);
      compatToast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      compatToast.error('Failed to delete category');
      console.error('Error deleting category:', error);
    }
  };

  const handleSaveCategory = async (categoryData: any) => {
    try {
      if (selectedCategory) {
        // Update existing category
        await strapiApi.updateCategory(selectedCategory.id, categoryData);
        compatToast.success('Category updated successfully');
      } else {
        // Create new category
        await strapiApi.createCategory(categoryData);
        compatToast.success('Category created successfully');
      }
      
      setIsDialogOpen(false);
      fetchCategories();
    } catch (error) {
      compatToast.error(`Failed to ${selectedCategory ? 'update' : 'create'} category`);
      console.error(`Error ${selectedCategory ? 'updating' : 'creating'} category:`, error);
    }
  };

  const filteredCategories = categories.filter(category => 
    category.attributes.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.attributes.description && category.attributes.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
          onClick={handleAddCategory}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Category
        </button>
      </div>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          {searchTerm ? 'No categories match your search.' : 'No categories found. Create your first category to get started.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          ))}
        </div>
      )}
      
      <CategoryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveCategory}
        category={selectedCategory}
      />
    </div>
  );
} 