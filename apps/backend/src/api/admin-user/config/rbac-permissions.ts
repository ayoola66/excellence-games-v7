import { AdminRole } from '../types'

export const DEFAULT_PERMISSIONS: Record<AdminRole, Record<string, boolean>> = {
  super_admin: {
    // System Management
    manageAdmins: true,
    manageRoles: true,
    managePermissions: true,
    viewAuditLogs: true,
    manageSystemSettings: true,
    
    // Content Management
    manageGames: true,
    manageQuestions: true,
    manageCategories: true,
    manageTags: true,
    
    // User Management
    manageUsers: true,
    viewUserStats: true,
    manageUserSubscriptions: true,
    
    // Shop Management
    manageProducts: true,
    manageOrders: true,
    viewFinancials: true,
    
    // Music Management
    manageBackgroundMusic: true,
    manageUserMusic: true,
    
    // Analytics
    viewAnalytics: true,
    exportData: true
  },
  
  dev_admin: {
    // System Management
    manageAdmins: true,
    manageRoles: false,
    managePermissions: false,
    viewAuditLogs: true,
    manageSystemSettings: true,
    
    // Content Management
    manageGames: true,
    manageQuestions: true,
    manageCategories: true,
    manageTags: true,
    
    // User Management
    manageUsers: true,
    viewUserStats: true,
    manageUserSubscriptions: false,
    
    // Shop Management
    manageProducts: true,
    manageOrders: false,
    viewFinancials: false,
    
    // Music Management
    manageBackgroundMusic: true,
    manageUserMusic: true,
    
    // Analytics
    viewAnalytics: true,
    exportData: true
  },
  
  shop_admin: {
    // System Management
    manageAdmins: false,
    manageRoles: false,
    managePermissions: false,
    viewAuditLogs: false,
    manageSystemSettings: false,
    
    // Content Management
    manageGames: false,
    manageQuestions: false,
    manageCategories: false,
    manageTags: false,
    
    // User Management
    manageUsers: false,
    viewUserStats: true,
    manageUserSubscriptions: true,
    
    // Shop Management
    manageProducts: true,
    manageOrders: true,
    viewFinancials: true,
    
    // Music Management
    manageBackgroundMusic: false,
    manageUserMusic: false,
    
    // Analytics
    viewAnalytics: true,
    exportData: true
  },
  
  content_admin: {
    // System Management
    manageAdmins: false,
    manageRoles: false,
    managePermissions: false,
    viewAuditLogs: false,
    manageSystemSettings: false,
    
    // Content Management
    manageGames: true,
    manageQuestions: true,
    manageCategories: true,
    manageTags: true,
    
    // User Management
    manageUsers: false,
    viewUserStats: true,
    manageUserSubscriptions: false,
    
    // Shop Management
    manageProducts: false,
    manageOrders: false,
    viewFinancials: false,
    
    // Music Management
    manageBackgroundMusic: true,
    manageUserMusic: false,
    
    // Analytics
    viewAnalytics: true,
    exportData: false
  },
  
  customer_admin: {
    // System Management
    manageAdmins: false,
    manageRoles: false,
    managePermissions: false,
    viewAuditLogs: false,
    manageSystemSettings: false,
    
    // Content Management
    manageGames: false,
    manageQuestions: false,
    manageCategories: false,
    manageTags: false,
    
    // User Management
    manageUsers: true,
    viewUserStats: true,
    manageUserSubscriptions: true,
    
    // Shop Management
    manageProducts: false,
    manageOrders: true,
    viewFinancials: false,
    
    // Music Management
    manageBackgroundMusic: false,
    manageUserMusic: true,
    
    // Analytics
    viewAnalytics: true,
    exportData: false
  }
}

export const ALLOWED_SECTIONS: Record<AdminRole, string[]> = {
  super_admin: [
    'dashboard',
    'system',
    'games',
    'questions',
    'categories',
    'users',
    'subscriptions',
    'shop',
    'orders',
    'music',
    'analytics'
  ],
  
  dev_admin: [
    'dashboard',
    'system',
    'games',
    'questions',
    'categories',
    'users',
    'music',
    'analytics'
  ],
  
  shop_admin: [
    'dashboard',
    'shop',
    'orders',
    'subscriptions',
    'analytics'
  ],
  
  content_admin: [
    'dashboard',
    'games',
    'questions',
    'categories',
    'music',
    'analytics'
  ],
  
  customer_admin: [
    'dashboard',
    'users',
    'orders',
    'subscriptions',
    'analytics'
  ]
}

export const ROLE_BADGES = {
  super_admin: 'red',
  dev_admin: 'black',
  shop_admin: 'green',
  content_admin: 'purple',
  customer_admin: 'orange'
} as const

export const ROLE_DISPLAY_NAMES = {
  super_admin: 'SA',
  dev_admin: 'DEV',
  shop_admin: 'SH',
  content_admin: 'CT',
  customer_admin: 'CS'
} as const 