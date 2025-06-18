'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { XMarkIcon } from '@heroicons/react/24/outline'
import compatToast from '@/lib/notificationManager'

interface Game {
  id: string
  name: string
  description: string
  type: 'straight' | 'nested'
  status: 'free' | 'premium'
  isActive: boolean
  thumbnail?: string | null
}

interface GameEditDialogProps {
  isOpen: boolean
  onClose: () => void
  game?: Game | null
  onSave: (gameData: FormData) => Promise<void>
}

export default function GameEditDialog({ isOpen, onClose, game, onSave }: GameEditDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'straight',
    status: 'free',
    isActive: true
  })
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when game changes or dialog opens/closes
  useEffect(() => {
    if (isOpen && game) {
      console.log('Setting form data for game:', game);
      setFormData({
        name: game.name || '',
        description: game.description || '',
        type: game.type || 'straight',
        status: game.status || 'free',
        isActive: game.isActive ?? true
      })
      
      // Handle thumbnail preview
      if (game.thumbnail) {
        console.log('Setting thumbnail preview from:', game.thumbnail);
        setThumbnailPreview(game.thumbnail);
      } else {
        setThumbnailPreview(null);
      }
    } else if (isOpen && !game) {
      // Reset form for new game
      console.log('Resetting form for new game');
      setFormData({
        name: '',
        description: '',
        type: 'straight',
        status: 'free',
        isActive: true
      })
      setThumbnail(null)
      setThumbnailPreview(null)
    }
  }, [isOpen, game])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB')
        return
      }
      
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setError('Only JPG, JPEG, and PNG files are allowed')
        return
      }
      
      setThumbnail(file)
      const previewUrl = URL.createObjectURL(file)
      setThumbnailPreview(previewUrl)
      setError(null)
      
      // Clean up the URL when component unmounts
      return () => URL.revokeObjectURL(previewUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Game name is required')
      }

      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('description', formData.description)
      submitData.append('type', formData.type)
      submitData.append('status', formData.status)
      submitData.append('isActive', String(formData.isActive))
      
      // Log form data for debugging
      console.log('Form data being submitted:', {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        isActive: formData.isActive
      });
      
      if (thumbnail) {
        console.log('Adding thumbnail to form data:', thumbnail.name, thumbnail.type, thumbnail.size);
        submitData.append('thumbnail', thumbnail)
      } else {
        console.log('No new thumbnail to upload');
      }

      console.log('Calling onSave with FormData');
      await onSave(submitData)
      console.log('Save completed successfully');
      
      onClose()
      compatToast.success(`Game ${game ? 'updated' : 'created'} successfully`)
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Failed to save game')
      compatToast.error(`Failed to ${game ? 'update' : 'create'} game`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {game ? 'Edit Game' : 'Create New Game'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Game Name*
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Game Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'straight' | 'nested' })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="straight">Linear</option>
                <option value="nested">Nested</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Access Level
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'free' | 'premium' })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Game is active and ready for players
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Thumbnail Image (2MB max, JPG/JPEG/PNG)
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          
          {thumbnailPreview && (
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={thumbnailPreview}
                alt="Game thumbnail preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setThumbnail(null)
                  setThumbnailPreview(null)
                }}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
              >
                <XMarkIcon className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : game ? 'Update Game' : 'Create Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 