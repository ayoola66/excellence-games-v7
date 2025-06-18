'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { strapiApi } from '@/lib/strapiApi'
import { User } from '@/types'
import compatToast from '@/lib/notificationManager'

// Define the context shape
interface UserDataContextType {
  users: User[]
  isLoading: boolean
  error: string | null
  refreshUsers: () => Promise<void>
  updateUser: (userId: number, userData: Partial<User>) => Promise<boolean>
}

// Create the context
const UserDataContext = createContext<UserDataContextType | undefined>(undefined)

// Provider component
export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Process user data to ensure subscription status is correct based on premiumExpiry
  const processUserData = useCallback((userData: any[]): User[] => {
    return userData.map(user => {
      const now = new Date()
      const expiryDate = user.premiumExpiry ? new Date(user.premiumExpiry) : null
      
      // Determine subscription status based on premiumExpiry
      const calculatedStatus = 
        expiryDate && expiryDate > now ? 'premium' : 'free'
      
      // Log any discrepancies for debugging
      if (user.subscriptionStatus !== calculatedStatus) {
        console.log(`Subscription status mismatch for user ${user.id}: 
          DB value: ${user.subscriptionStatus}, 
          Calculated value: ${calculatedStatus}, 
          Expiry: ${user.premiumExpiry}`)
      }
      
      return {
        id: user.id,
        username: user.username || '',
        email: user.email || '',
        fullName: user.fullName || user.profile?.fullName || '',
        // Use calculated status based on expiry date
        subscriptionStatus: calculatedStatus,
        blocked: user.blocked || false,
        confirmed: user.confirmed || false,
        premiumExpiry: user.premiumExpiry || null,
        createdAt: user.createdAt || '',
        updatedAt: user.updatedAt || ''
      }
    })
  }, [])

  // Fetch user data function - single source of truth
  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Single API call
      const response = await strapiApi.get('/api/users')
      console.log('Raw API response:', response.data)
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format')
      }
      
      // Process data with validation and subscription status calculation
      const processedData = processUserData(response.data)
      console.log('Processed user data:', processedData)
      
      setUsers(processedData)
    } catch (error) {
      console.error('Error fetching user data:', error)
      setError('Failed to load users. Please try again.')
      compatToast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }, [processUserData])

  // Update a user
  const updateUser = useCallback(async (userId: number, userData: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // If updating subscription status to premium but no expiry date provided,
      // set a default expiry date of 1 year from now
      if (userData.subscriptionStatus === 'premium' && !userData.premiumExpiry) {
        const oneYearFromNow = new Date()
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
        userData.premiumExpiry = oneYearFromNow.toISOString()
      }
      
      // If updating to free, clear expiry date
      if (userData.subscriptionStatus === 'free') {
        userData.premiumExpiry = undefined
      }
      
      await strapiApi.updateUser(userId, {
        username: userData.username,
        email: userData.email,
        profile: {
          fullName: userData.fullName
        },
        subscriptionStatus: userData.subscriptionStatus,
        premiumExpiry: userData.premiumExpiry,
        phone: userData.phone,
        address: userData.address,
        blocked: userData.blocked
      })
      
      // Refresh the user list to get updated data
      await fetchUserData()
      return true
    } catch (error) {
      console.error('Error updating user:', error)
      compatToast.error('Failed to update user')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [fetchUserData])

  // Fetch data on component mount
  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  // Create a stable context value
  const contextValue = useMemo(() => ({
    users,
    isLoading,
    error,
    refreshUsers: fetchUserData,
    updateUser
  }), [users, isLoading, error, fetchUserData, updateUser])

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  )
}

// Custom hook for using the context
export const useUserData = (): UserDataContextType => {
  const context = useContext(UserDataContext)
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider')
  }
  return context
} 