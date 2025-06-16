'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { strapiApi } from '@/lib/strapiApi';
import { toast } from 'react-hot-toast';

export default function NewGameQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params; // game id
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: 'option1',
    explanation: '',
    category: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const gameRes = await strapiApi.getGame(id);
      const cats = gameRes.data.attributes?.categories?.data || [];
      setCategories(cats.map(cat => ({ id: cat.id, name: cat.attributes?.name }))); 
    } catch {}
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!form.question.trim() || !form.option1.trim() || !form.option2.trim() || !form.option3.trim() || !form.option4.trim()) {
      setError('All question and option fields are required.');
      setLoading(false);
      return;
    }
    try {
      await strapiApi.createQuestion({
        ...form,
        game: id,
        category: form.category || undefined,
      });
      toast.success('Question created successfully.');
      router.push(`/admin/games/${id}/questions`);
    } catch (err) {
      setError('Failed to create question.');
      toast.error('Failed to create question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Add New Question</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Question</label>
          <textarea
            name="question"
            value={form.question}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            rows={2}
            required
          />
        </div>
        {[1,2,3,4].map(n => (
          <div key={n}>
            <label className="block mb-1 font-medium">Option {n}</label>
            <input
              type="text"
              name={`option${n}`}
              value={form[`option${n}`]}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
        ))}
        <div>
          <label className="block mb-1 font-medium">Correct Answer</label>
          <select
            name="correctAnswer"
            value={form.correctAnswer}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
            <option value="option4">Option 4</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Explanation (optional)</label>
          <textarea
            name="explanation"
            value={form.explanation}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            rows={2}
          />
        </div>
        {categories.length > 0 && (
          <div>
            <label className="block mb-1 font-medium">Category (optional)</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">None</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Question'}
        </button>
      </form>
    </div>
  );
} 