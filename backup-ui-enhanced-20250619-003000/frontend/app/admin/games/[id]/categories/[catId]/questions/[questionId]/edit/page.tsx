'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { strapiApi } from '@/lib/strapiApi';
import compatToast from '@/lib/notificationManager';

export default function EditCategoryQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const { id, catId, questionId } = params;
  const [form, setForm] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: 'option1',
    explanation: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [questionId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const qRes = await strapiApi.getQuestion(questionId);
      const q = qRes.data.attributes;
      setForm({
        question: q.question || '',
        option1: q.option1 || '',
        option2: q.option2 || '',
        option3: q.option3 || '',
        option4: q.option4 || '',
        correctAnswer: q.correctAnswer || 'option1',
        explanation: q.explanation || '',
      });
    } catch (err) {
      setError('Failed to fetch question details.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    if (!form.question.trim() || !form.option1.trim() || !form.option2.trim() || !form.option3.trim() || !form.option4.trim()) {
      setError('All question and option fields are required.');
      setSaving(false);
      return;
    }
    try {
      await strapiApi.updateQuestion(questionId, {
        ...form,
        game: id,
        category: catId,
      });
      compatToast.success('Question updated successfully.');
      router.push(`/admin/games/${id}/categories/${catId}/questions`);
    } catch (err) {
      setError('Failed to update question.');
      compatToast.error('Failed to update question.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading question details...</div>;

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Question in Category</h1>
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
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
} 