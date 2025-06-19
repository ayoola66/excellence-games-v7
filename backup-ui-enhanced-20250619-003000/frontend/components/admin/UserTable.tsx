'use client'

import { useState, memo } from 'react'
import { User } from '@/types'
import compatToast from '@/lib/notificationManager'
import { useUserData } from '@/context/UserDataContext'
import { strapiApi } from '@/lib/strapiApi'
import { useUserManagement } from '@/hooks/useUserManagement'

// Subscription Badge Component
const SubscriptionBadge = memo(({ status, expiryDate }: { status: 'free' | 'premium', expiryDate?: string | null }) => {
  return (
    <div className="flex flex-col">
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        status === 'premium' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {status}
      </span>
      {status === 'premium' && expiryDate && (
        <span className="text-xs text-gray-500 mt-1">
          Expires: {new Date(expiryDate).toLocaleDateString()}
        </span>
      )}
    </div>
  );
});

SubscriptionBadge.displayName = 'SubscriptionBadge';

// Memoized User Table Row component
const UserTableRow = memo(({ 
  user, 
  onEdit, 
  onDelete 
}: { 
  user: User, 
  onEdit: (user: User) => void, 
  onDelete: (id: number) => void 
}) => {
  return (
    <tr key={user.id}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{user.username}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{user.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{user.fullName || '-'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <SubscriptionBadge status={user.subscriptionStatus} expiryDate={user.premiumExpiry} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <button
          onClick={() => onEdit(user)}
          className="text-indigo-600 hover:text-indigo-900 mr-4"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(user.id)}
          className="text-red-600 hover:text-red-900"
        >
          Delete
        </button>
      </td>
    </tr>
  );
});

UserTableRow.displayName = 'UserTableRow';

const UserTable = () => {
  // Get user data from context
  const { users, isLoading, error, refreshUsers } = useUserData()
  const { handleEditUser } = useUserManagement()
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('')
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'free' | 'premium'>('all')

  // Filter users based on search term and subscription filter
  const filteredUsers = users.filter(user => {
    // Apply search filter if needed
    const matchesSearch = !searchTerm || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    // Apply subscription filter if needed
    const matchesSubscription = subscriptionFilter === 'all' || 
      user.subscriptionStatus === subscriptionFilter
    
    return matchesSearch && matchesSubscription
  })

  // Handle search
  const handleSearch = () => {
    // Search is already handled by the filter function
    // This is just to handle the search button click
  }

  // Handle delete user
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    try {
      await strapiApi.delete(`/api/users/${id}`)
      compatToast.success('User deleted successfully')
      // Refetch data after deletion
      refreshUsers()
    } catch (error) {
      compatToast.error('Failed to delete user')
      console.error('Error deleting user:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={() => {/* Add user logic */}}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add User
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <select
          value={subscriptionFilter}
          onChange={(e) => setSubscriptionFilter(e.target.value as 'all' | 'free' | 'premium')}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Subscriptions</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <UserTableRow 
                  key={user.id}
                  user={user}
                  onEdit={handleEditUser}
                  onDelete={handleDelete}
                />
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default UserTable 