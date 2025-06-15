'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { strapiApi } from '@/lib/strapiApi';
import { toast } from 'react-hot-toast';

export default function CategoryQuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const { id, catId } = params;
  const [questions, setQuestions] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [catId]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const catRes = await strapiApi.getCategory(catId);
      setCategoryName(catRes.data.attributes?.name || '');
      const qRes = await strapiApi.getQuestionsForCategory(catId);
      setQuestions(qRes);
    } catch (err) {
      setError('Failed to fetch questions.');
      toast.error('Failed to fetch questions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (qid) => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) return;
    try {
      await strapiApi.deleteQuestion(qid);
      setQuestions(questions.filter(q => q.id !== qid));
      toast.success('Question deleted successfully.');
    } catch (err) {
      toast.error('Failed to delete question.');
    }
  };

  const filteredQuestions = questions.filter(q =>
    q.question?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Questions for Category: {categoryName}</h1>
      <button
        className="mb-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
        onClick={() => router.push(`/admin/games/${id}/categories/${catId}/questions/new`)}
      >
        Add New Question
      </button>
      <button
        className="mb-4 ml-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        onClick={() => router.push(`/admin/games/${id}/categories`)}
      >
        Back to Categories
      </button>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
      </div>
      {isLoading ? (
        <div>Loading questions...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Question</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map(q => (
              <tr key={q.id}>
                <td className="border px-4 py-2">{q.question}</td>
                <td className="border px-4 py-2">
                  <button
                    className="mr-2 text-blue-700 underline"
                    onClick={() => router.push(`/admin/games/${id}/categories/${catId}/questions/${q.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-700 underline"
                    onClick={() => handleDelete(q.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 