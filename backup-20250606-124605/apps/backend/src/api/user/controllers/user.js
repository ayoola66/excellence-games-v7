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
          premiumExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
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
          premiumExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString() // 6 months from now
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
})) 