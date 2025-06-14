'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = createCoreController('api::admin-user.admin-user', ({ strapi }) => ({
  async find(ctx) {
    try {
      const admins = await strapi.db.query('api::admin-user.admin-user').findMany({
        select: ['id', 'email', 'fullName', 'adminType', 'badge', 'isActive', 'lastLogin'],
      });
      return { data: admins };
    } catch (error) {
      console.error('Find admins error:', error);
      return ctx.internalServerError('Failed to fetch admins');
    }
  },

  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const admin = await strapi.db.query('api::admin-user.admin-user').findOne({
        where: { id },
        select: ['id', 'email', 'fullName', 'adminType', 'badge', 'isActive', 'lastLogin'],
      });

      if (!admin) {
        return ctx.notFound('Admin not found');
      }

      return { data: admin };
    } catch (error) {
      console.error('Find admin error:', error);
      return ctx.internalServerError('Failed to fetch admin');
    }
  },

  async create(ctx) {
    try {
      const { email, password, fullName, adminType, badge } = ctx.request.body;

      if (!email || !password || !fullName || !adminType || !badge) {
        return ctx.badRequest('Missing required fields');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = await strapi.db.query('api::admin-user.admin-user').create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          adminType,
          badge,
          isActive: true,
        },
      });

      return {
        data: {
          id: admin.id,
          email: admin.email,
          fullName: admin.fullName,
          adminType: admin.adminType,
          badge: admin.badge,
        },
      };
    } catch (error) {
      console.error('Create admin error:', error);
      return ctx.internalServerError('Failed to create admin');
    }
  },

  async login(ctx) {
    try {
      const { email, password } = ctx.request.body;
      
      if (!email || !password) {
        return ctx.badRequest('Email and password are required');
      }

      // Find the admin user
      const admin = await strapi.db.query('api::admin-user.admin-user').findOne({
        where: { email, isActive: true },
      });

      if (!admin) {
        return ctx.unauthorized('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password);
      
      if (!isValidPassword) {
        return ctx.unauthorized('Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: admin.id,
          email: admin.email,
          adminType: admin.adminType
        },
        process.env.JWT_SECRET || 'your-jwt-secret',
        { expiresIn: '8h' }
      );

      // Update last login
      await strapi.db.query('api::admin-user.admin-user').update({
        where: { id: admin.id },
        data: { lastLogin: new Date() }
      });

      return {
        data: {
          token,
          admin: {
            id: admin.id,
            email: admin.email,
            fullName: admin.fullName,
            adminType: admin.adminType,
            badge: admin.badge,
            permissions: admin.permissions,
          },
        },
      };
    } catch (error) {
      console.error('Admin login error:', error);
      return ctx.internalServerError('Failed to login');
    }
  },

  async verifySession(ctx) {
    try {
      const { authorization } = ctx.request.headers;
      
      if (!authorization || !authorization.startsWith('Bearer ')) {
        return ctx.unauthorized('No token provided');
      }

      const token = authorization.substring(7);

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
        
        // Find admin user
        const admin = await strapi.db.query('api::admin-user.admin-user').findOne({
          where: { id: decoded.id, isActive: true },
        });

        if (!admin) {
          return ctx.unauthorized('Invalid session');
        }

        return {
          data: {
            admin: {
              id: admin.id,
              email: admin.email,
              fullName: admin.fullName,
              adminType: admin.adminType,
              badge: admin.badge,
              permissions: admin.permissions,
            },
            valid: true,
          },
        };
      } catch (error) {
        return ctx.unauthorized('Invalid token');
      }
    } catch (error) {
      console.error('Session verification error:', error);
      return ctx.internalServerError('Failed to verify session');
    }
  },
})); 