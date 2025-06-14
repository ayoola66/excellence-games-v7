'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
  async login(ctx) {
    try {
      const { email, password } = ctx.request.body;
      
      if (!email || !password) {
        return ctx.badRequest('Email and password are required');
      }

      // Find the admin user by email
      const adminUser = await strapi.db.query('api::admin-user.admin-user').findOne({
        where: { email, isActive: true },
      });

      if (!adminUser) {
        console.log('Admin login failed: User not found -', email);
        return ctx.unauthorized('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, adminUser.password);
      
      if (!isValidPassword) {
        console.log('Admin login failed: Invalid password -', email);
        return ctx.unauthorized('Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: adminUser.id,
          email: adminUser.email,
          adminType: adminUser.adminType
        },
        process.env.JWT_SECRET || 'your-jwt-secret',
        { expiresIn: '8h' }
      );

      // Update last login
      await strapi.db.query('api::admin-user.admin-user').update({
        where: { id: adminUser.id },
        data: { 
          lastLogin: new Date(),
          sessionToken: token
        }
      });

      console.log('Admin login successful:', email);

      return {
        data: {
          token,
          admin: {
            id: adminUser.id,
            email: adminUser.email,
            fullName: adminUser.fullName,
            adminType: adminUser.adminType,
            badge: adminUser.badge,
            permissions: adminUser.permissions,
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
        const adminUser = await strapi.db.query('api::admin-user.admin-user').findOne({
          where: { id: decoded.id, isActive: true },
        });

        if (!adminUser || adminUser.sessionToken !== token) {
          return ctx.unauthorized('Invalid session');
        }

        return {
          data: {
            admin: {
              id: adminUser.id,
              email: adminUser.email,
              fullName: adminUser.fullName,
              adminType: adminUser.adminType,
              badge: adminUser.badge,
              permissions: adminUser.permissions,
            },
            valid: true,
          },
        };
      } catch (error) {
        console.error('Token verification error:', error);
        return ctx.unauthorized('Invalid token');
      }
    } catch (error) {
      console.error('Session verification error:', error);
      return ctx.internalServerError('Failed to verify session');
    }
  },
}; 