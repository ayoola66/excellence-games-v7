'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { strapiApi } from '@/lib/strapiApi';
import compatToast from '@/lib/notificationManager';
import {
  DocumentArrowUpIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

interface Question {
  id: string;
  attributes: {
    question: string;
    option1: string;
    option2: string;
    option3: string;
    option4: string;
    correctAnswer: string;
    explanation?: string;
    category?: {
      data: {
        id: string;
        attributes: {
          name: string;
        };
      };
    };
    game?: {
      data: {
        id: string;
        attributes: {
          name: string;
        };
      };
    };
    isActive?: boolean;
  };
}

interface QuestionCardProps {
  question: Question;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

const QuestionCard = ({ question, onEdit, onDelete }: QuestionCardProps) => {
  const [showOptions, setShowOptions] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:border-blue-300 transition-colors">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-md font-medium text-gray-900 line-clamp-2 flex-1">{question.attributes.question}</h3>
          <div className="flex space-x-1 ml-2">
            <button
              onClick={() => onEdit(question)}
              className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(question.id)}
              className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-2 text-xs">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
            {question.attributes.game?.data?.attributes.name || 'No Game'}
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
            {question.attributes.category?.data?.attributes.name || 'No Category'}
          </span>
          {question.attributes.isActive !== undefined && (
            <span className={`px-2 py-1 rounded-full ${question.attributes.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {question.attributes.isActive ? 'Active' : 'Inactive'}
            </span>
          )}
        </div>
        
        <button 
          onClick={() => setShowOptions(!showOptions)}
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
        >
          {showOptions ? 'Hide options' : 'Show options'}
          <ChevronRightIcon className={`h-3 w-3 ml-1 transition-transform ${showOptions ? 'rotate-90' : ''}`} />
        </button>
        
        {showOptions && (
          <div className="mt-2 space-y-1 text-xs">
            <div className={`p-1 rounded ${question.attributes.correctAnswer === 'option1' ? 'bg-green-100' : ''}`}>
              A: {question.attributes.option1}
            </div>
            <div className={`p-1 rounded ${question.attributes.correctAnswer === 'option2' ? 'bg-green-100' : ''}`}>
              B: {question.attributes.option2}
            </div>
            <div className={`p-1 rounded ${question.attributes.correctAnswer === 'option3' ? 'bg-green-100' : ''}`}>
              C: {question.attributes.option3}
            </div>
            <div className={`p-1 rounded ${question.attributes.correctAnswer === 'option4' ? 'bg-green-100' : ''}`}>
              D: {question.attributes.option4}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function QuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [games, setGames] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const questionsPerPage = 20;

  useEffect(() => {
    fetchQuestions();
    fetchGames();
    fetchCategories();
  }, [currentPage]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, you would use pagination parameters
      const response = await strapiApi.getAdminQuestions();
      setQuestions(response.data);
      
      // Calculate total pages
      setTotalPages(Math.ceil(response.data.length / questionsPerPage));
    } catch (err) {
      setError('Failed to fetch questions.');
      compatToast.error('Failed to fetch questions.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await strapiApi.getAdminGames();
      setGames(response.data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await strapiApi.get('/api/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleEditQuestion = (question: Question) => {
    router.push(`/admin/questions/${question.id}/edit`);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) return;
    
    try {
      await strapiApi.deleteQuestion(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
      compatToast.success('Question deleted successfully');
    } catch (err) {
      compatToast.error('Failed to delete question');
    }
  };

  const handleBulkDelete = async (categoryId: string) => {
    if (!confirm(`Are you sure you want to delete ALL questions in this category? This action cannot be undone.`)) return;
    
    try {
      // This would be implemented in the backend
      await strapiApi.post(`/api/categories/${categoryId}/questions/delete`);
      compatToast.success('Questions deleted successfully');
      fetchQuestions();
    } catch (err) {
      compatToast.error('Failed to delete questions');
    }
  };

  const filteredQuestions = questions.filter(q => {
    // Apply search filter
    const matchesSearch = !search || 
      q.attributes.question.toLowerCase().includes(search.toLowerCase()) ||
      q.attributes.option1.toLowerCase().includes(search.toLowerCase()) ||
      q.attributes.option2.toLowerCase().includes(search.toLowerCase()) ||
      q.attributes.option3.toLowerCase().includes(search.toLowerCase()) ||
      q.attributes.option4.toLowerCase().includes(search.toLowerCase());
    
    // Apply game filter
    const matchesGame = !selectedGame || 
      q.attributes.game?.data?.id === selectedGame;
    
    // Apply category filter
    const matchesCategory = !selectedCategory || 
      q.attributes.category?.data?.id === selectedCategory;
    
    return matchesSearch && matchesGame && matchesCategory;
  });

  // Pagination
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * questionsPerPage, 
    currentPage * questionsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Questions Management</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/admin/questions/new')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Question
          </button>
          <button
            onClick={() => router.push('/admin/questions/import')}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
            Bulk Import
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center flex-1">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions, options..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ml-2 block w-full border-0 focus:ring-0 text-gray-900 placeholder:text-gray-400 sm:text-sm"
              />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-1" />
              Filters
            </button>
          </div>
          
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Game</label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  <option value="">All Games</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="flex items-center">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.attributes.name}
                      </option>
                    ))}
                  </select>
                  
                  {selectedCategory && (
                    <button
                      onClick={() => handleBulkDelete(selectedCategory)}
                      className="ml-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Delete All
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-gray-600">Loading questions...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : paginatedQuestions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No questions found. Try adjusting your search or filters.
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onEdit={handleEditQuestion}
                  onDelete={handleDeleteQuestion}
                />
              ))}
            </div>
            
            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * questionsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * questionsPerPage, filteredQuestions.length)}
                </span>{' '}
                of <span className="font-medium">{filteredQuestions.length}</span> questions
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {Math.max(1, totalPages)}
                </span>
                <button
                  onClick={nextPage}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 disabled:opacity-50"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 