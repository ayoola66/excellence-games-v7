'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { strapiApi } from '@/lib/strapiApi';
import compatToast from '@/lib/notificationManager';

export default function NewCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params; // game id
  const [form, setForm] = useState({
    name: '',
    description: '',
    cardNumber: '',
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
      await strapiApi.createCategory({
        ...form,
        cardNumber: form.cardNumber ? Number(form.cardNumber) : undefined,
        game: id,
      });
      compatToast.success('Category created successfully.');
      router.push(`/admin/games/${id}/categories`);
    } catch (err) {
      setError('Failed to create category.');
      compatToast.error('Failed to create category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Add New Category</h1>
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
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            rows={3}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Card Number</label>
          <input
            type="number"
            name="cardNumber"
            value={form.cardNumber}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            min="1"
            max="6"
          />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Category'}
        </button>
      </form>
    </div>
  );
} 