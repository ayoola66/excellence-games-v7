const strapi = require('@strapi/strapi');

async function cleanCategories() {
  console.log('🧹 Starting category cleanup...');
  
  try {
    // Initialize Strapi
    const app = await strapi.createStrapi();
    await app.load();
    
    // Get all categories
    const categories = await app.entityService.findMany('api::category.category');
    console.log(`Found ${categories.length} categories to delete`);
    
    // Delete all categories
    const deletedIds = [];
    for (const category of categories) {
      await app.entityService.delete('api::category.category', category.id);
      deletedIds.push(category.id);
      console.log(`Deleted category: ${category.name} (ID: ${category.id})`);
    }
    
    console.log(`✅ Successfully deleted ${deletedIds.length} categories`);
    
    // Close Strapi
    await app.destroy();
    
  } catch (error) {
    console.error('❌ Error cleaning categories:', error);
    process.exit(1);
  }
}

cleanCategories(); 