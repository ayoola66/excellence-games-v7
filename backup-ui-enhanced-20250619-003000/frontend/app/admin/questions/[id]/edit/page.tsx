'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { strapiApi } from '@/lib/strapiApi';
import compatToast from '@/lib/notificationManager';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface Game {
  id: string;
  name: string;
  type: string;
  status: string;
  totalQuestions: number;
  categories: Array<{
    id: string;
    attributes: {
      name: string;
      description?: string;
      questionCount?: number;
    };
  }>;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: 'option1',
    explanation: '',
    game: '',
    category: '',
  });

  useEffect(() => {
    Promise.all([fetchQuestion(), fetchGames()]);
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      const response = await strapiApi.getQuestion(questionId);
      const question = response.data;
      console.log('Question data:', question);
      
      if (!question || !question.attributes) {
        throw new Error('Invalid question data received');
      }
      
      setForm({
        question: question.attributes.question,
        option1: question.attributes.option1,
        option2: question.attributes.option2,
        option3: question.attributes.option3,
        option4: question.attributes.option4,
        correctAnswer: question.attributes.correctAnswer,
        explanation: question.attributes.explanation || '',
        game: question.attributes.game?.data?.id || '',
        category: question.attributes.category?.data?.id || '',
      });
    } catch (err) {
      console.error('Error fetching question:', err);
      setError('Failed to fetch question.');
      compatToast.error('Failed to fetch question.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await strapiApi.getAdminGames();
      setGames(response.data || []);
      console.log('Games fetched:', response.data);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError('Failed to fetch games.');
      compatToast.error('Failed to fetch games.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    if (!form.question.trim() || !form.option1.trim() || !form.option2.trim() || !form.option3.trim() || !form.option4.trim()) {
      setError('All question and option fields are required.');
      setIsSaving(false);
      return;
    }

    try {
      console.log('Submitting question update:', {
        ...form,
        game: form.game || undefined,
        category: form.category || undefined,
      });
      
      await strapiApi.updateQuestion(questionId, {
        question: form.question,
        option1: form.option1,
        option2: form.option2,
        option3: form.option3,
        option4: form.option4,
        correctAnswer: form.correctAnswer,
        explanation: form.explanation,
        game: form.game || undefined,
        category: form.category || undefined,
      });
      
      compatToast.success('Question updated successfully.');
      router.push('/admin/questions');
    } catch (err) {
      console.error('Error updating question:', err);
      setError('Failed to update question.');
      compatToast.error('Failed to update question.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Question</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Game (Optional)
          </label>
          <select
            name="game"
            value={form.game}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a game</option>
            {games.map(game => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>

        {form.game && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category (Optional)
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a category</option>
              {games
                .find(g => g.id === form.game)
                ?.categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.attributes.name}
                  </option>
                )) || []}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question
          </label>
          <textarea
            name="question"
            value={form.question}
            onChange={handleChange}
            rows={3}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {[1, 2, 3, 4].map(n => (
          <div key={n}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Option {n}
            </label>
            <input
              type="text"
              name={`option${n}`}
              value={form[`option${n}` as keyof typeof form]}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correct Answer
          </label>
          <select
            name="correctAnswer"
            value={form.correctAnswer}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
            <option value="option4">Option 4</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation (Optional)
          </label>
          <textarea
            name="explanation"
            value={form.explanation}
            onChange={handleChange}
            rows={3}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/admin/questions')}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isSaving ? (
              <>
                <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 