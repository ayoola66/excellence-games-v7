module.exports = {
  beforeCreate(event) {
    const { data } = event.params;
    const { type, name, categories } = data;

    // For STRAIGHT games, create a default category if none provided
    if (type === 'STRAIGHT' && (!categories || categories.length === 0)) {
      data.categories = [{
        name: name,  // Use game name as default category name
        description: `Default category for ${name}`,
      }];
    }

    // For NESTED games, ensure categories array is provided
    if (type === 'NESTED' && (!categories || categories.length === 0)) {
      throw new Error('NESTED games require at least one category');
    }
  },

  async afterCreate(event) {
    const { result, params } = event;
    const { categories } = params.data;
    
    if (!categories || categories.length === 0) return;

    try {
      // Create categories and link them to the game
      const createdCategories = await Promise.all(
        categories.map(category => 
          strapi.entityService.create('api::category.category', {
            data: {
              ...category,
              game: result.id,
              publishedAt: new Date()
            }
          })
        )
      );

      // Update the game with the created categories
      await strapi.entityService.update('api::game.game', result.id, {
        data: {
          categories: createdCategories.map(cat => cat.id)
        }
      });
    } catch (error) {
      console.error('Error creating categories:', error);
      // Roll back game creation if category creation fails
      await strapi.entityService.delete('api::game.game', result.id);
      throw error;
    }
  }
};
