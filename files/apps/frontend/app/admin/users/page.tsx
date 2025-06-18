'use client'

import { useState } from 'react'
import UserTable from '@/components/admin/UserTable'
import { strapiApi } from '@/lib/strapiApi'
import compatToast from '@/lib/notificationManager'
import { useUserManagement } from '@/hooks/useUserManagement'
import { EditUserDialog } from '@/components/admin/EditUserDialog'

export default function UsersPage() {
  const [isSyncing, setIsSyncing] = useState(false)
  const {
    selectedUser,
    isEditDialogOpen,
    handleEditUser,
    handleUpdateUser,
    handleCloseDialog
  } = useUserManagement()

  const handleSyncSubscriptions = async () => {
    try {
      setIsSyncing(true)
      const response = await strapiApi.post('/api/admin/users/sync-subscription-statuses')
      
      if (response.data?.success) {
        compatToast.success('Subscription statuses synchronized successfully')
      } else {
        throw new Error('Failed to synchronize subscription statuses')
      }
    } catch (error) {
      console.error('Error syncing subscription statuses:', error)
      compatToast.error('Failed to synchronize subscription statuses')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button
          onClick={handleSyncSubscriptions}
          disabled={isSyncing}
          className={`px-4 py-2 rounded text-white ${
            isSyncing ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSyncing ? 'Syncing...' : 'Sync Subscription Statuses'}
        </button>
      </div>
      <UserTable />
      
      <EditUserDialog
        open={isEditDialogOpen}
        onClose={handleCloseDialog}
        user={selectedUser}
      />
    </div>
  )
} 