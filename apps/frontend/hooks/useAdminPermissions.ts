import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'
import type { AdminPermissions } from '@/types/admin'

export function useAdminPermissions() {
  const { admin } = useContext(AuthContext)

  const hasPermission = (permission: keyof AdminPermissions): boolean => {
    if (!admin?.permissions) return false
    return admin.permissions[permission] || false
  }

  const hasAnyPermission = (permissions: Array<keyof AdminPermissions>): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (permissions: Array<keyof AdminPermissions>): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }

  const canAccessSection = (section: string): boolean => {
    if (!admin?.allowedSections) return false
    return admin.allowedSections.includes(section)
  }

  const isRole = (role: string): boolean => {
    if (!admin?.role) return false
    return admin.role === role
  }

  const isAnyRole = (roles: string[]): boolean => {
    return roles.some(role => isRole(role))
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessSection,
    isRole,
    isAnyRole,
    admin
  }
} 