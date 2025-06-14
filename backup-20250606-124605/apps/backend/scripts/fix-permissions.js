// Simple API permission fixer script
console.log('🔐 API Permission Setup Guide');
console.log('================================\n');

console.log('Since you\'re having permission issues, here are the API endpoints to enable:\n');

console.log('🎮 GAMES API:');
console.log('GET    /api/games           - List all games');
console.log('GET    /api/games/:id       - Get single game');
console.log('POST   /api/games           - Create new game');
console.log('PUT    /api/games/:id       - Update game');
console.log('DELETE /api/games/:id       - Delete game\n');

console.log('📂 CATEGORIES API:');
console.log('GET    /api/categories      - List all categories');
console.log('GET    /api/categories/:id  - Get single category');
console.log('POST   /api/categories      - Create new category');
console.log('PUT    /api/categories/:id  - Update category');
console.log('DELETE /api/categories/:id  - Delete category\n');

console.log('❓ QUESTIONS API:');
console.log('GET    /api/questions       - List all questions');
console.log('GET    /api/questions/:id   - Get single question');
console.log('POST   /api/questions       - Create new question');
console.log('PUT    /api/questions/:id   - Update question');
console.log('DELETE /api/questions/:id   - Delete question\n');

console.log('🛒 PRODUCTS API:');
console.log('GET    /api/products        - List all products');
console.log('GET    /api/products/:id    - Get single product');
console.log('POST   /api/products        - Create new product');
console.log('PUT    /api/products/:id    - Update product');
console.log('DELETE /api/products/:id    - Delete product\n');

console.log('🔧 MANUAL PERMISSION SETUP:');
console.log('1. Start your backend server: npm run develop');
console.log('2. Go to http://localhost:1337/admin');
console.log('3. Login with your admin credentials');
console.log('4. Go to Settings > Users & Permissions plugin > Roles');
console.log('5. Click on "Public" role');
console.log('6. Enable these permissions for each content type:');
console.log('   - Game: find, findOne');
console.log('   - Category: find, findOne');
console.log('   - Question: find, findOne');
console.log('   - Product: find, findOne');
console.log('7. Click on "Authenticated" role');
console.log('8. Enable ALL permissions for each content type\n');

console.log('🚀 ALTERNATIVE: Direct API Test');
console.log('Test your APIs with these curl commands:\n');

console.log('# Test Games API');
console.log('curl -X GET http://localhost:1337/api/games');
console.log('');

console.log('# Test Categories API');
console.log('curl -X GET http://localhost:1337/api/categories');
console.log('');

console.log('# Test Questions API');
console.log('curl -X GET http://localhost:1337/api/questions');
console.log('');

console.log('# Test Products API');
console.log('curl -X GET http://localhost:1337/api/products');
console.log('');

console.log('# Create a test product');
console.log(`curl -X POST http://localhost:1337/api/products \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": {
      "name": "Test Board Game",
      "description": "A test product",
      "price": 29.99,
      "sku": "TEST001",
      "stock": 10,
      "type": "board_game",
      "isActive": true
    }
  }'`);
console.log(''); 