'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import compatToast from '@/lib/notificationManager';
import api from '@/lib/api'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
  })
  const [avatar, setAvatar] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // naïve update – you may have a dedicated endpoint
      await api.updateUserPreferences({ fullName: form.fullName, phone: form.phone, address: form.address })
      compatToast.success('Profile updated')
      updateUser({ ...(user as any), ...form })
    } catch (err) {
      compatToast.error('Failed to update profile')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
      <button onClick={() => router.push('/user/dashboard')} className="flex items-center text-blue-700 mb-6">
        <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back to Dashboard
      </button>

      <div className="max-w-xl mx-auto bg-white shadow rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea name="address" value={form.address} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar (max 1 MB)</label>
            <input type="file" accept="image/*" onChange={e => setAvatar(e.target.files?.[0] || null)} />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Save</button>
        </form>
      </div>
    </div>
  )
} 