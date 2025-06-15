// Mock user credentials
export const mockUsers = [
  {
    email: 'user@elitegames.com',
    password: 'Passw0rd',
    user: {
      id: '1',
      email: 'user@elitegames.com',
      fullName: 'Demo User',
      subscriptionStatus: 'free',
      gameProgress: {},
      musicPreferences: {}
    }
  },
  {
    email: 'premium@elitegames.com',
    password: 'Passw0rd',
    user: {
      id: '2',
      email: 'premium@elitegames.com',
      fullName: 'Premium User',
      subscriptionStatus: 'premium',
      premiumExpiry: '2025-12-31T23:59:59.000Z',
      gameProgress: {},
      musicPreferences: {}
    }
  }
]

// Mock admin credentials
export const mockAdmins = [
  {
    email: 'superadmin@elitegames.com',
    password: 'Passw0rd',
    admin: {
      id: '1',
      email: 'superadmin@elitegames.com',
      fullName: 'Super Administrator',
      adminType: 'SA',
      badge: 'SA',
      permissions: [
        'manage_trivia', 'manage_users', 'manage_admins', 'manage_music',
        'manage_shop', 'view_orders', 'view_subscriptions', 'view_analytics',
        'system_settings', 'financial_data'
      ]
    }
  },
  {
    email: 'devadmin@elitegames.com',
    password: 'Passw0rd',
    admin: {
      id: '2',
      email: 'devadmin@elitegames.com',
      fullName: 'Development Administrator',
      adminType: 'DEV',
      badge: 'DEV',
      permissions: [
        'manage_trivia', 'manage_users', 'manage_limited_admins', 'manage_music',
        'manage_shop', 'view_analytics', 'system_settings'
      ]
    }
  },
  {
    email: 'contentadmin@elitegames.com',
    password: 'Passw0rd',
    admin: {
      id: '3',
      email: 'contentadmin@elitegames.com',
      fullName: 'Content Administrator',
      adminType: 'CT',
      badge: 'CT',
      permissions: [
        'manage_trivia', 'manage_content', 'manage_questions', 'view_analytics'
      ]
    }
  },
  {
    email: 'shopadmin@elitegames.com',
    password: 'Passw0rd',
    admin: {
      id: '4',
      email: 'shopadmin@elitegames.com',
      fullName: 'Shop Administrator',
      adminType: 'SH',
      badge: 'SH',
      permissions: [
        'manage_shop', 'view_orders', 'manage_products', 'view_analytics'
      ]
    }
  },
  {
    email: 'customeradmin@elitegames.com',
    password: 'Passw0rd',
    admin: {
      id: '5',
      email: 'customeradmin@elitegames.com',
      fullName: 'Customer Support Administrator',
      adminType: 'CS',
      badge: 'CS',
      permissions: [
        'view_users', 'manage_support', 'view_orders', 'view_analytics'
      ]
    }
  }
] 