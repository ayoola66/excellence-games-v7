'use client';

import React, { useState, useEffect } from 'react';
import { Category } from '@/types';

interface SimplifiedCategory {
  id: string;
  name: string;
  description?: string;
  gameId?: string;
}

interface CategoryManagerProps {
  gameId: string;
  initialCategories?: SimplifiedCategory[];
  onChange: (categories: SimplifiedCategory[]) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  gameId,
  initialCategories = [],
  onChange
}) => {
  const [categories, setCategories] = useState<SimplifiedCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Initialize with 5 categories if none exist
  useEffect(() => {
    if (initialCategories.length > 0) {
      setCategories(initialCategories);
    } else {
      // Create 5 default categories
      const defaultCategories = Array(5).fill(null).map((_, index) => ({
        id: `temp-${index}`,
        name: `Category ${index + 1}`,
        description: '',
        gameId
      }));
      setCategories(defaultCategories);
      onChange(defaultCategories);
    }
  }, [gameId, initialCategories, onChange]);

  const handleCategoryChange = (index: number, field: keyof SimplifiedCategory, value: string) => {
    const updatedCategories = [...categories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      [field]: value
    };
    setCategories(updatedCategories);
    onChange(updatedCategories);
  };

  const addCategory = () => {
    if (categories.length >= 5) {
      alert('Nested games can have a maximum of 5 categories');
      return;
    }
    
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }
    
    const newCategory: SimplifiedCategory = {
      id: `temp-${Date.now()}`,
      name: newCategoryName,
      description: '',
      gameId
    };
    
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    setNewCategoryName('');
    onChange(updatedCategories);
  };

  const removeCategory = (index: number) => {
    if (categories.length <= 1) {
      alert('Nested games must have at least 1 category');
      return;
    }
    
    const updatedCategories = categories.filter((_, i) => i !== index);
    setCategories(updatedCategories);
    onChange(updatedCategories);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Game Categories (5 Required)</h3>
      <p className="text-sm text-gray-500 mb-4">
        Each nested game requires exactly 5 categories. Each category corresponds to a sheet in the XLSX file.
      </p>
      
      <div className="space-y-4">
        {categories.map((category, index) => (
          <div key={category.id} className="flex items-center space-x-4">
            <div className="flex-grow">
              <input
                type="text"
                value={category.name}
                onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                placeholder={`Category ${index + 1} Name`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <button
              type="button"
              onClick={() => removeCategory(index)}
              className="p-2 text-red-500 hover:text-red-700"
              disabled={categories.length <= 5}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      
      {categories.length < 5 && (
        <div className="flex items-center mt-4">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New Category Name"
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mr-2"
          />
          <button
            type="button"
            onClick={addCategory}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Category
          </button>
        </div>
      )}
      
      {categories.length !== 5 && (
        <div className="text-yellow-600 bg-yellow-50 p-3 rounded-md mt-2">
          <strong>Note:</strong> Nested games require exactly 5 categories. 
          You currently have {categories.length} {categories.length === 1 ? 'category' : 'categories'}.
        </div>
      )}
    </div>
  );
}; 