export type AdminRole = 'super_admin' | 'dev_admin' | 'shop_admin' | 'content_admin' | 'customer_admin'

export type AdminBadge = 'red' | 'black' | 'green' | 'purple' | 'orange'

export type AdminDisplayRole = 'SA' | 'DEV' | 'SH' | 'CT' | 'CS'

export interface AdminPermissions {
  // System Management
  manageAdmins: boolean
  manageRoles: boolean
  managePermissions: boolean
  viewAuditLogs: boolean
  manageSystemSettings: boolean
  
  // Content Management
  manageGames: boolean
  manageQuestions: boolean
  manageCategories: boolean
  manageTags: boolean
  
  // User Management
  manageUsers: boolean
  viewUserStats: boolean
  manageUserSubscriptions: boolean
  
  // Shop Management
  manageProducts: boolean
  manageOrders: boolean
  viewFinancials: boolean
  
  // Music Management
  manageBackgroundMusic: boolean
  manageUserMusic: boolean
  
  // Analytics
  viewAnalytics: boolean
  exportData: boolean
}

export interface AdminUser {
  id: number
  email: string
  fullName: string
  role: AdminRole
  displayRole: AdminDisplayRole
  badge: AdminBadge
  permissions: AdminPermissions
  isActive: boolean
  lastLogin?: Date
  lastLoginIP?: string
  profilePicture?: {
    url: string
    width: number
    height: number
  }
  allowedSections: string[]
  auditLog?: Array<{
    action: string
    timestamp: Date
    details: any
  }>
  createdAt: Date
  updatedAt: Date
} 