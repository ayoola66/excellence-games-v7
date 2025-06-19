import React, { useState } from 'react';
import { Game } from '@/types';
import { validateQuestionFile } from '@/utils/validation';

interface GameCreationFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  isEditing?: boolean;
  initialData?: Game;
}

export const GameCreationForm: React.FC<GameCreationFormProps> = ({ 
  onSubmit, 
  isEditing = false,
  initialData
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [type, setType] = useState<'linear' | 'nested'>(
    (initialData?.type as 'linear' | 'nested') || 'linear'
  );
  const [status, setStatus] = useState<'free' | 'premium'>(
    (initialData?.status as 'free' | 'premium') || 'free'
  );
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(() => {
    if (initialData?.thumbnail && typeof initialData.thumbnail === 'object' && 'url' in initialData.thumbnail) {
      return initialData.thumbnail.url;
    }
    return null;
  });
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleQuestionFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        await validateQuestionFile(file, type);
        setQuestionFile(file);
        setFileError(null);
      } catch (error: any) {
        setQuestionFile(null);
        setFileError(error.message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify({
        name,
        description,
        type,
        status,
        isActive: true
      }));
      
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }
      
      await onSubmit(formData);
      
      // Reset form if not editing
      if (!isEditing) {
        setName('');
        setDescription('');
        setType('linear');
        setStatus('free');
        setThumbnail(null);
        setThumbnailPreview(null);
        setQuestionFile(null);
      }
    } catch (error) {
      console.error('Error submitting game:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Game Name</label>
        <input
          id="name"
          type="text"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          rows={4}
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Game Type</label>
        <select
          id="type"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={type}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setType(e.target.value as 'linear' | 'nested');
          }}
        >
          <option value="linear">Linear Game (CSV format)</option>
          <option value="nested">Nested Game with Categories (XLSX format)</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          {type === 'linear' 
            ? 'Linear games use CSV files for question import' 
            : 'Nested games require XLSX files with 5 sheets (one per category)'}
        </p>
      </div>
      
      <div className="mb-4">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Subscription Status</label>
        <select
          id="status"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={status}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setStatus(e.target.value as 'free' | 'premium');
          }}
        >
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          {status === 'premium' 
            ? 'Only premium users can access this game' 
            : 'All users can access this game'}
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Game Thumbnail</label>
        <div className="mt-1 flex items-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="hidden"
            id="thumbnail-upload"
          />
          <label htmlFor="thumbnail-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Upload Thumbnail
          </label>
        </div>
        
        {thumbnailPreview && (
          <div className="mt-2">
            <img 
              src={thumbnailPreview} 
              alt="Thumbnail preview" 
              className="max-w-[200px] max-h-[200px] object-contain border border-gray-300 rounded-md" 
            />
          </div>
        )}
      </div>
      
      {!isEditing && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Question Import File {type === 'linear' ? '(CSV)' : '(XLSX with 5 sheets)'}
          </label>
          <div className="mt-1 flex items-center">
            <input
              type="file"
              accept={type === 'linear' ? '.csv' : '.xlsx'}
              onChange={handleQuestionFileChange}
              className="hidden"
              id="question-file-upload"
            />
            <label htmlFor="question-file-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Upload Question File
            </label>
          </div>
          
          {questionFile && (
            <p className="mt-1 text-sm text-gray-500">
              Selected file: {questionFile.name}
            </p>
          )}
          
          {fileError && (
            <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {fileError}
            </div>
          )}
          
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {type === 'linear' ? (
                <>
                  CSV Format: question,option1,option2,option3,option4,option5,correctAnswer<br />
                  Example: "What is 2+2?","1","2","3","4","5","4"
                </>
              ) : (
                <>
                  XLSX Format: 5 sheets (one per category)<br />
                  Each sheet must have columns: question, option1, option2, option3, option4, option5, correctAnswer
                </>
              )}
            </p>
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <button 
          type="submit" 
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Game' : 'Create Game'}
        </button>
      </div>
    </form>
  );
}; 