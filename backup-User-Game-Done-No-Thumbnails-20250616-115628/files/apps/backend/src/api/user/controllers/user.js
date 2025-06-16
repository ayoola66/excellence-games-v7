'use strict'

const { createCoreController } = require('@strapi/strapi').factories

// Only override seedDemoUsers, inherit all other core methods
module.exports = createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
  
  // Seed demo users for testing
  async seedDemoUsers(ctx) {
    try {
      console.log('🌱 Seeding demo users...')
      
      const demoUsers = [
        {
          username: 'user1',
          email: 'user1@elitegames.com', 
          password: 'Passw0rd',
          fullName: 'John Smith',
          phone: '+44 7700 900001',
          address: '123 High Street, London, UK',
          subscriptionStatus: 'free',
          confirmed: true,
          blocked: false
        },
        {
          username: 'user2',
          email: 'user2@elitegames.com',
          password: 'Passw0rd', 
          fullName: 'Sarah Johnson',
          phone: '+44 7700 900002',
          address: '456 Queen Street, Manchester, UK',
          subscriptionStatus: 'premium',
          confirmed: true,
          blocked: false,
          premiumExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
        },
        {
          username: 'user3',
          email: 'user3@elitegames.com',
          password: 'Passw0rd',
          fullName: 'David Brown',  
          phone: '+44 7700 900003',
          address: '789 King Street, Birmingham, UK',
          subscriptionStatus: 'free',
          confirmed: true,
          blocked: false
        },
        {
          username: 'user4',
          email: 'user4@elitegames.com',
          password: 'Passw0rd',
          fullName: 'Emma Wilson',
          phone: '+44 7700 900004', 
          address: '321 Princess Avenue, Leeds, UK',
          subscriptionStatus: 'premium',
          confirmed: true,
          blocked: false,
          premiumExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString() // 6 months from now
        },
        {
          username: 'user5',
          email: 'user5@elitegames.com',
          password: 'Passw0rd',
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
  },

  async me(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    const userData = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
      populate: ['favoriteGames', 'customMusicTrack']
    });

    return userData;
  },

  async toggleFavorite(ctx) {
    const { id: gameId } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized();
    }

    try {
      // Check if game exists
      const game = await strapi.entityService.findOne('api::game.game', gameId);
      if (!game) {
        return ctx.notFound('Game not found');
      }

      // Get current user with favorites
      const userData = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
        populate: ['favoriteGames']
      });

      // Check if game is already favorited
      const isFavorited = userData.favoriteGames.some(g => g.id === parseInt(gameId));

      if (isFavorited) {
        // Remove from favorites
        await strapi.entityService.update('plugin::users-permissions.user', user.id, {
          data: {
            favoriteGames: userData.favoriteGames.filter(g => g.id !== parseInt(gameId))
          }
        });
      } else {
        // Add to favorites
        await strapi.entityService.update('plugin::users-permissions.user', user.id, {
          data: {
            favoriteGames: [...userData.favoriteGames, gameId]
          }
        });
      }

      return { success: true, isFavorited: !isFavorited };
    } catch (error) {
      return ctx.badRequest('Failed to toggle favorite');
    }
  },

  async updateRecentGames(ctx) {
    const { id: gameId } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized();
    }

    try {
      const userData = await strapi.entityService.findOne('plugin::users-permissions.user', user.id);
      const recentGames = userData.recentGames || [];

      // Remove game if it exists and add it to the front
      const updatedGames = [
        gameId,
        ...recentGames.filter(id => id !== gameId)
      ].slice(0, 3); // Keep only last 3 games

      await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          recentGames: updatedGames
        }
      });

      return { success: true };
    } catch (error) {
      return ctx.badRequest('Failed to update recent games');
    }
  },

  async updateSettings(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    try {
      const { preferences } = ctx.request.body;
      const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          preferences
        }
      });

      return updatedUser;
    } catch (error) {
      return ctx.badRequest('Failed to update settings');
    }
  },

  async updateBillingInfo(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    try {
      const { billingInfo } = ctx.request.body;
      const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          billingInfo
        }
      });

      return updatedUser;
    } catch (error) {
      return ctx.badRequest('Failed to update billing information');
    }
  },

  async uploadMusicTrack(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }

    try {
      // Handle file upload
      const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
        data: {}, // optional
        files: ctx.request.files.files,
      });

      if (!uploadedFiles || uploadedFiles.length === 0) {
        return ctx.badRequest('No file uploaded');
      }

      // Update user with new music track
      const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
        data: {
          customMusicTrack: uploadedFiles[0].id
        }
      });

      return updatedUser;
    } catch (error) {
      return ctx.badRequest('Failed to upload music track');
    }
  }
})) 