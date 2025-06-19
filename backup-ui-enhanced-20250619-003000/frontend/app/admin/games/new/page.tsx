'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { strapiApi } from '@/lib/strapiApi';
import compatToast from '@/lib/notificationManager';

export default function NewGamePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    type: 'straight',
    status: 'free',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!form.name.trim()) {
      setError('Name is required.');
      setLoading(false);
      return;
    }
    try {
      await strapiApi.createGame(form);
      compatToast.success('Game created successfully.');
      router.push('/admin/games');
    } catch (err) {
      setError('Failed to create game.');
      compatToast.error('Failed to create game.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Add New Game</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="straight">Straight</option>
            <option value="nested">Nested</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            rows={3}
          />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Game'}
        </button>
      </form>
    </div>
  );
} 