'use client'

import { useState } from 'react'
import { User } from '@/types'
import { useUserData } from '@/context/UserDataContext'
import compatToast from '@/lib/notificationManager'

export const useUserManagement = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { updateUser, refreshUsers } = useUserData()

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleUpdateUser = async (userData: User): Promise<boolean> => {
    try {
      if (!userData || !userData.id) {
        throw new Error('Invalid user data')
      }

      const success = await updateUser(userData.id, {
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone,
        address: userData.address,
        subscriptionStatus: userData.subscriptionStatus,
        premiumExpiry: userData.premiumExpiry,
        blocked: userData.blocked
      })

      if (success) {
        compatToast.success('User updated successfully')
        await refreshUsers()
        return true
      } else {
        throw new Error('Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      compatToast.error(error instanceof Error ? error.message : 'Failed to update user')
      return false
    }
  }

  const handleDeleteUser = async (userId: number): Promise<boolean> => {
    try {
      // Implement delete user logic here
      // This could call a method from UserDataContext
      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      compatToast.error('Failed to delete user')
      return false
    }
  }

  return {
    selectedUser,
    isEditDialogOpen,
    handleEditUser,
    handleUpdateUser,
    handleDeleteUser,
    handleCloseDialog: () => setIsEditDialogOpen(false)
  }
} 