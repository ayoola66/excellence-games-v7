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
      const defaultAdmins = [
        {
          email: 'superadmin@elitegames.com',
          password: 'SuperAdmin2024!',
          fullName: 'Super Administrator',
          adminType: 'SA',
          badge: 'SA',
        },
        {
          email: 'devadmin@elitegames.com',
          password: 'DevAdmin2024!',
          fullName: 'Development Administrator',
          adminType: 'DEV',
          badge: 'DEV',
        },
        {
          email: 'shopadmin@elitegames.com',
          password: 'ShopAdmin2024!',
          fullName: 'Shop Administrator',
          adminType: 'SH',
          badge: 'SH',
        },
        {
          email: 'contentadmin@elitegames.com',
          password: 'ContentAdmin2024!',
          fullName: 'Content Administrator',
          adminType: 'CT',
          badge: 'CT',
        },
        {
          email: 'customeradmin@elitegames.com',
          password: 'CustomerAdmin2024!',
          fullName: 'Customer Administrator',
          adminType: 'CS',
          badge: 'CS',
        },
      ];

      const createdAdmins = [];

      for (const adminData of defaultAdmins) {
        // Check if admin already exists
        const existing = await strapi.entityService.findMany('api::admin-user.admin-user', {
          filters: { email: adminData.email },
        });

        if (!existing || existing.length === 0) {
          // Hash password
          const hashedPassword = await bcrypt.hash(adminData.password, 10);
          
          // Create admin
          const admin = await strapi.entityService.create('api::admin-user.admin-user', {
            data: {
              ...adminData,
              password: hashedPassword,
              permissions: getAdminPermissions(adminData.adminType),
              isActive: true,
            },
          });

          createdAdmins.push({
            email: admin.email,
            adminType: admin.adminType,
            fullName: admin.fullName,
          });
        }
      }

      return {
        data: {
          message: `Created ${createdAdmins.length} admin users`,
          admins: createdAdmins,
        },
      };
    } catch (error) {
      console.error('Seed admin error:', error);
      ctx.throw(500, 'Failed to seed admin users');
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