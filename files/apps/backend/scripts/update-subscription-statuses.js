'use strict';

/**
 * Script to update all users' subscription statuses based on their premium expiry dates
 * 
 * This script:
 * 1. Fetches all users from the database
 * 2. For each user, checks if their premiumExpiry date is valid and in the future
 * 3. Updates their subscriptionStatus to match their premium status
 * 4. Logs the results
 * 
 * Usage: node scripts/update-subscription-statuses.js
 */

module.exports = {
  async run({ strapi }) {
    try {
      console.log('🔄 Starting subscription status synchronization...');
      
      // Get all users
      const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
        fields: ['id', 'username', 'email', 'subscriptionStatus', 'premiumExpiry'],
      });
      
      console.log(`📊 Found ${users.length} users to process`);
      
      let updatedCount = 0;
      let noChangeCount = 0;
      let errorCount = 0;
      
      const now = new Date();
      
      // Process each user
      for (const user of users) {
        try {
          // Determine correct subscription status based on premium expiry
          const expiryDate = user.premiumExpiry ? new Date(user.premiumExpiry) : null;
          const shouldBePremium = expiryDate && expiryDate > now;
          const correctStatus = shouldBePremium ? 'premium' : 'free';
          
          // Check if update is needed
          if (user.subscriptionStatus !== correctStatus) {
            console.log(`🔄 User ${user.username} (${user.email}): ${user.subscriptionStatus} -> ${correctStatus}`);
            
            // Update user
            await strapi.entityService.update('plugin::users-permissions.user', user.id, {
              data: {
                subscriptionStatus: correctStatus,
                // If setting to free, clear the expiry date
                ...(correctStatus === 'free' && { premiumExpiry: null })
              }
            });
            
            updatedCount++;
          } else {
            noChangeCount++;
          }
        } catch (error) {
          console.error(`❌ Error processing user ${user.id}:`, error.message);
          errorCount++;
        }
      }
      
      console.log('\n📝 Summary:');
      console.log(`✅ Updated: ${updatedCount} users`);
      console.log(`⏭️ No change needed: ${noChangeCount} users`);
      console.log(`❌ Errors: ${errorCount} users`);
      console.log('✨ Subscription status synchronization complete!');
      
    } catch (error) {
      console.error('❌ Failed to synchronize subscription statuses:', error);
    }
  }
}; 