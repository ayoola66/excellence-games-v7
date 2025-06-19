'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'
import compatToast from '@/lib/notificationManager'
import { useUserData } from '@/context/UserDataContext'

interface EditUserDialogProps {
  open: boolean
  onClose: () => void
  user: User | null
}

export const EditUserDialog = ({ open, onClose, user }: EditUserDialogProps) => {
  const [formData, setFormData] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { updateUser } = useUserData()

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData(user)
    }
  }, [user])

  // Handle form field changes
  const handleChange = (field: keyof User) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => 
      prev ? {
        ...prev,
        [field]: event.target.value
      } : null
    )
  }

  // Handle date change for premium expiry
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = event.target.value
    if (!dateValue) {
      setFormData(prev => 
        prev ? {
          ...prev,
          premiumExpiry: null
        } : null
      )
      return
    }

    // Convert date string to ISO string
    const date = new Date(dateValue)
    setFormData(prev => 
      prev ? {
        ...prev,
        premiumExpiry: date.toISOString()
      } : null
    )
  }

  // Handle subscription status change
  const handleSubscriptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const status = event.target.value as 'free' | 'premium'
    
    setFormData(prev => {
      if (!prev) return null

      // If changing to free, clear premium expiry
      if (status === 'free') {
        return {
          ...prev,
          subscriptionStatus: status,
          premiumExpiry: null
        }
      }
      
      // If changing to premium and no expiry set, set default (1 year from now)
      if (status === 'premium' && !prev.premiumExpiry) {
        const oneYearFromNow = new Date()
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
        
        return {
          ...prev,
          subscriptionStatus: status,
          premiumExpiry: oneYearFromNow.toISOString()
        }
      }
      
      return {
        ...prev,
        subscriptionStatus: status
      }
    })
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData || !formData.id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const success = await updateUser(formData.id, {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        subscriptionStatus: formData.subscriptionStatus,
        premiumExpiry: formData.premiumExpiry
      })
      
      if (success) {
        compatToast.success('User updated successfully')
        onClose()
      } else {
        throw new Error('Failed to update user')
      }
    } catch (err) {
      console.error('Error updating user:', err)
      setError(err instanceof Error ? err.message : 'Failed to update user')
      compatToast.error('Failed to update user')
    } finally {
      setIsLoading(false)
    }
  }

  if (!open || !formData) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Edit User Details</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username || ''}
                  onChange={handleChange('username')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={handleChange('email')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName || ''}
                  onChange={handleChange('fullName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={handleChange('phone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, address: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              {/* Subscription Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription Status
                </label>
                <select
                  value={formData.subscriptionStatus || 'free'}
                  onChange={handleSubscriptionChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              
              {/* Premium Expiry Date (only shown if subscription is premium) */}
              {formData.subscriptionStatus === 'premium' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Premium Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.premiumExpiry ? new Date(formData.premiumExpiry).toISOString().split('T')[0] : ''}
                    onChange={handleDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              
              {/* User Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Status
                </label>
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="blocked"
                    checked={formData.blocked || false}
                    onChange={(e) => setFormData(prev => prev ? { ...prev, blocked: e.target.checked } : null)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="blocked" className="ml-2 block text-sm text-gray-700">
                    Block User
                  </label>
                </div>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>
          
          {/* Form actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isLoading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 