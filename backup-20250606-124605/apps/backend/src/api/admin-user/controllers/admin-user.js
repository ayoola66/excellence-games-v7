'use strict';

/**
 * admin-user controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = createCoreController('api::admin-user.admin-user', ({ strapi }) => ({
  // Admin login
  async login(ctx) {
    const { email, password } = ctx.request.body;

    if (!email || !password) {
      return ctx.badRequest('Email and password are required');
    }

    try {
      // Find admin user
      const admins = await strapi.entityService.findMany('api::admin-user.admin-user', {
        filters: { email, isActive: true },
        limit: 1,
      });

      console.log('Found admins:', admins?.length);

      if (!admins || admins.length === 0) {
        console.log('No admin found with email:', email);
        return ctx.unauthorized('Invalid credentials');
      }

      const adminUser = admins[0];
      console.log('Admin user found:', { id: adminUser.id, email: adminUser.email, hasPassword: !!adminUser.password });

      // Verify password
      const isValidPassword = await bcrypt.compare(password, adminUser.password);
      console.log('Password valid:', isValidPassword);
      
      if (!isValidPassword) {
        return ctx.unauthorized('Invalid credentials');
      }

      // Generate session token
      const sessionToken = jwt.sign(
        { 
          adminId: adminUser.id, 
          adminType: adminUser.adminType,
          email: adminUser.email 
        },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '8h' }
      );

      // Update last login and session token
      await strapi.entityService.update('api::admin-user.admin-user', adminUser.id, {
        data: {
          lastLogin: new Date(),
          sessionToken,
        },
      });

      // Set admin permissions based on type
      const permissions = getAdminPermissions(adminUser.adminType);

      return {
        data: {
          admin: {
            id: adminUser.id,
            email: adminUser.email,
            fullName: adminUser.fullName,
            adminType: adminUser.adminType,
            badge: adminUser.badge,
            permissions,
          },
          token: sessionToken,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      ctx.throw(500, 'Login failed');
    }
  },

  // Create initial admin users
  async seedAdmins(ctx) {
    try {
      console.log('🌱 Seeding admin accounts...')
      
      const admins = [
        {
          email: 'superadmin@elitegames.com',
          password: 'SuperAdmin2024!',
          fullName: 'Super Administrator',
          adminType: 'SA',
          badge: 'SA',
          role: 'super_admin',
          permissions: ['all'],
          isActive: true
        },
        {
          email: 'devadmin@elitegames.com', 
          password: 'DevAdmin2024!',
          fullName: 'Development Administrator',
          adminType: 'DEV',
          badge: 'DEV',
          role: 'dev_admin',
          permissions: ['games', 'questions', 'analytics'],
          isActive: true
        },
        {
          email: 'contentadmin@elitegames.com',
          password: 'ContentAdmin2024!', 
          fullName: 'Content Administrator',
          adminType: 'CT',
          badge: 'CT',
          role: 'content_admin',
          permissions: ['games', 'questions', 'music'],
          isActive: true
        },
        {
          email: 'shopadmin@elitegames.com',
          password: 'ShopAdmin2024!',
          fullName: 'Shop Administrator', 
          adminType: 'SH',
          badge: 'SH',
          role: 'shop_admin',
          permissions: ['shop', 'users', 'orders'],
          isActive: true
        },
        {
          email: 'customeradmin@elitegames.com',
          password: 'CustomerAdmin2024!',
          fullName: 'Customer Service Administrator',
          adminType: 'CS',
          badge: 'CS',
          role: 'customer_admin', 
          permissions: ['users', 'analytics'],
          isActive: true
        }
      ]

      const createdAdmins = []
      
      for (const adminData of admins) {
        try {
          // Check if admin already exists
          const existingAdmin = await strapi.db.query('api::admin-user.admin-user').findOne({
            where: { email: adminData.email }
          })
          
          if (existingAdmin) {
            // If existing admin password appears to be unhashed (length < 55)
            if (existingAdmin.password && existingAdmin.password.length < 55) {
              const hashed = await bcrypt.hash(adminData.password, 10)
              await strapi.db.query('api::admin-user.admin-user').update({
                where: { id: existingAdmin.id },
                data: { password: hashed }
              })
              console.log(`🔒 Hashed password for ${adminData.email}`)
              existingAdmin.password = hashed
            }
            // Ensure adminType/badge fields
            if (!existingAdmin.adminType) {
              await strapi.db.query('api::admin-user.admin-user').update({
                where: { id: existingAdmin.id },
                data: { adminType: adminData.adminType, badge: adminData.badge }
              })
            }
            console.log(`✓ Admin ${adminData.email} already exists`)
            createdAdmins.push(existingAdmin)
            continue
          }
          
          // Hash password
          const hashedPassword = await bcrypt.hash(adminData.password, 10)

          // Create the admin with hashed password
          const admin = await strapi.db.query('api::admin-user.admin-user').create({
            data: { ...adminData, password: hashedPassword }
          })
          
          console.log(`✓ Created admin: ${adminData.email}`)
          createdAdmins.push(admin)
          
        } catch (error) {
          console.error(`❌ Error creating admin ${adminData.email}:`, error.message)
        }
      }
      
      console.log(`🎉 Admins created: ${createdAdmins.length}/${admins.length}`)
      
      ctx.body = {
        success: true,
        message: `Admin accounts created successfully!`,
        admins: createdAdmins.map(admin => ({
          id: admin.id,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role
        }))
      }
      
    } catch (error) {
      console.error('❌ Error seeding admins:', error)
      ctx.throw(500, 'Failed to seed admin accounts')
    }
  },

  // Verify admin session
  async verifySession(ctx) {
    const { authorization } = ctx.headers;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return ctx.unauthorized('No token provided');
    }

    const token = authorization.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
      
      // Find admin with current session token
      const admin = await strapi.entityService.findOne('api::admin-user.admin-user', decoded.adminId);

      if (!admin || !admin.isActive || admin.sessionToken !== token) {
        return ctx.unauthorized('Invalid session');
      }

      const permissions = getAdminPermissions(admin.adminType);

      return {
        data: {
          admin: {
            id: admin.id,
            email: admin.email,
            fullName: admin.fullName,
            adminType: admin.adminType,
            badge: admin.badge,
            permissions,
          },
          valid: true,
        },
      };
    } catch (error) {
      return ctx.unauthorized('Invalid token');
    }
  },

  // Admin logout
  async logout(ctx) {
    const { authorization } = ctx.headers;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return ctx.unauthorized('No token provided');
    }

    const token = authorization.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
      
      // Clear session token
      await strapi.entityService.update('api::admin-user.admin-user', decoded.adminId, {
        data: { sessionToken: null },
      });

      return { data: { message: 'Logged out successfully' } };
    } catch (error) {
      return ctx.unauthorized('Invalid token');
    }
  },

  // Get dashboard data based on admin permissions
  async getDashboardData(ctx) {
    const { user: admin } = ctx.state;
    
    if (!admin) {
      return ctx.unauthorized('Admin authentication required');
    }

    try {
      const permissions = getAdminPermissions(admin.adminType);
      const dashboardData = {};

      // Games and content data
      if (permissions.includes('manage_trivia') || permissions.includes('view_analytics')) {
        const games = await strapi.entityService.findMany('api::game.game', {
          populate: { categories: { populate: { questions: true } } },
        });
        
        dashboardData.games = {
          total: games.length,
          free: games.filter(g => g.status === 'free').length,
          premium: games.filter(g => g.status === 'premium').length,
          totalQuestions: games.reduce((total, game) => 
            total + (game.categories?.reduce((catTotal, cat) => 
              catTotal + (cat.questions?.length || 0), 0) || 0), 0),
        };
      }

      // User data
      if (permissions.includes('manage_users') || permissions.includes('view_analytics')) {
        const users = await strapi.entityService.findMany('plugin::users-permissions.user');
        
        dashboardData.users = {
          total: users.length,
          premium: users.filter(u => u.subscriptionStatus === 'premium').length,
          free: users.filter(u => u.subscriptionStatus === 'free').length,
        };
      }

      // Music data
      if (permissions.includes('manage_music')) {
        const backgroundMusic = await strapi.entityService.findMany('api::background-music.background-music');
        const userMusic = await strapi.entityService.findMany('api::user-music.user-music');
        
        dashboardData.music = {
          backgroundTracks: backgroundMusic.length,
          userTracks: userMusic.length,
          activeTracks: backgroundMusic.filter(m => m.isActive).length,
        };
      }

      return { data: dashboardData };
    } catch (error) {
      ctx.throw(500, 'Failed to fetch dashboard data');
    }
  },

  // Seed demo users for testing
  async seedDemoUsers(ctx) {
    try {
      console.log('🌱 Seeding demo users...')
      
      const demoUsers = [
        {
          username: 'demouser1',
          email: 'demo1@elitegames.com', 
          password: 'DemoUser1!',
          fullName: 'John Smith',
          phone: '+44 7700 900001',
          address: '123 High Street, London, UK',
          subscriptionStatus: 'free',
          confirmed: true,
          blocked: false
        },
        {
          username: 'demouser2',
          email: 'demo2@elitegames.com',
          password: 'DemoUser2!', 
          fullName: 'Sarah Johnson',
          phone: '+44 7700 900002',
          address: '456 Queen Street, Manchester, UK',
          subscriptionStatus: 'premium',
          confirmed: true,
          blocked: false,
          premiumExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          username: 'demouser3',
          email: 'demo3@elitegames.com',
          password: 'DemoUser3!',
          fullName: 'David Brown',  
          phone: '+44 7700 900003',
          address: '789 King Street, Birmingham, UK',
          subscriptionStatus: 'free',
          confirmed: true,
          blocked: false
        },
        {
          username: 'demouser4',
          email: 'demo4@elitegames.com',
          password: 'DemoUser4!',
          fullName: 'Emma Wilson',
          phone: '+44 7700 900004', 
          address: '321 Princess Avenue, Leeds, UK',
          subscriptionStatus: 'premium',
          confirmed: true,
          blocked: false,
          premiumExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          username: 'demouser5',
          email: 'demo5@elitegames.com',
          password: 'DemoUser5!',
          fullName: 'Michael Davis',
          phone: '+44 7700 900005',
          address: '654 Victoria Road, Edinburgh, UK', 
          subscriptionStatus: 'free',
          confirmed: true,
          blocked: false
        }
      ]

      const createdUsers = []
      
      for (const userData of demoUsers) {
        try {
          // Check if user already exists
          const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { email: userData.email }
          })
          
          if (existingUser) {
            console.log(`✓ User ${userData.email} already exists`)
            createdUsers.push(existingUser)
            continue
          }
          
          // Get the default user role
          const defaultRole = await strapi.db.query('plugin::users-permissions.role').findOne({
            where: { type: 'authenticated' }
          })
          
          if (!defaultRole) {
            console.error('❌ Default user role not found')
            continue
          }
          
          // Create the user
          const user = await strapi.db.query('plugin::users-permissions.user').create({
            data: {
              ...userData,
              role: defaultRole.id,
              provider: 'local'
            }
          })
          
          console.log(`✓ Created user: ${userData.email} (${userData.fullName})`)
          createdUsers.push(user)
          
        } catch (error) {
          console.error(`❌ Error creating user ${userData.email}:`, error.message)
        }
      }
      
      console.log(`🎉 Demo users created: ${createdUsers.length}/${demoUsers.length}`)
      
      ctx.body = {
        success: true,
        message: `Demo users created successfully!`,
        users: createdUsers.map(user => ({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          subscriptionStatus: user.subscriptionStatus,
          premiumExpiry: user.premiumExpiry
        }))
      }
      
    } catch (error) {
      console.error('❌ Error seeding demo users:', error)
      ctx.throw(500, 'Failed to seed demo users')
    }
  }
}));

// Helper function to define permissions based on admin type
function getAdminPermissions(adminType) {
  const permissions = {
    SA: [
      'manage_trivia', 'manage_users', 'manage_admins', 'manage_music',
      'manage_shop', 'view_orders', 'view_subscriptions', 'view_analytics',
      'system_settings', 'financial_data'
    ],
    DEV: [
      'manage_trivia', 'manage_users', 'manage_limited_admins', 'manage_music',
      'manage_shop', 'view_analytics', 'system_settings'
    ],
    SH: [
      'manage_shop', 'manage_products', 'view_orders', 'manage_inventory'
    ],
    CT: [
      'manage_trivia', 'manage_content', 'manage_questions', 'view_analytics'
    ],
    CS: [
      'manage_users', 'view_support', 'view_user_analytics'
    ],
  };

  return permissions[adminType] || [];
} 