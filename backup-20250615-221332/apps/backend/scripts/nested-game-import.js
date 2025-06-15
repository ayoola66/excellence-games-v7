const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Nested Game Question Import Script
async function importNestedGameQuestions() {
  console.log('🧪 Starting NESTED game question import...');
  
  // Configuration for nested games
  const GAME_NAME = 'Science Game';
  const EXCEL_FILE = 'science_nested.xlsx'; // Your nested game template
  const GAME_TYPE = 'nested';
  
  try {
    // Check if Excel file exists
    const filePath = path.join(__dirname, EXCEL_FILE);
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Excel file ${EXCEL_FILE} not found in scripts folder`);
      console.log('📋 Creating nested game template...');
      
      // Create nested game template with 5 categories (sheets)
      const categories = ['Physics', 'Chemistry', 'Biology', 'Astronomy', 'Environmental Science'];
      
      const wb = XLSX.utils.book_new();
      
      categories.forEach((category, index) => {
        const sampleData = [
          {
            'Question Text': `Sample ${category} question 1 - What is a fundamental concept in ${category}?`,
            'Option A': 'Option A answer',
            'Option B': 'Option B answer', 
            'Option C': 'Option C answer',
            'Option D': 'Option D answer',
            'Correct Answer': 'A',
            'Category': category,
            'Card Number': index + 1
          },
          {
            'Question Text': `Sample ${category} question 2 - What is another concept in ${category}?`,
            'Option A': 'Option A answer',
            'Option B': 'Option B answer',
            'Option C': 'Option C answer', 
            'Option D': 'Option D answer',
            'Correct Answer': 'B',
            'Category': category,
            'Card Number': index + 1
          }
        ];
        
        const ws = XLSX.utils.json_to_sheet(sampleData);
        XLSX.utils.book_append_sheet(wb, ws, category);
      });
      
      XLSX.writeFile(wb, filePath);
      
      console.log(`✅ Nested game template created: ${filePath}`);
      console.log('📝 Each sheet represents a category (card) in your nested game');
      console.log('🎯 Fill in your questions for each category and run the script again');
      return;
    }
    
    // Read Excel file and process each sheet (category)
    console.log(`📖 Reading nested game file: ${EXCEL_FILE}...`);
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    console.log(`Found ${sheetNames.length} categories (sheets): ${sheetNames.join(', ')}`);
    
    // Generate API calls for nested game structure
    console.log('\n🚀 NESTED GAME CREATION SEQUENCE:');
    console.log('Copy these API calls and run them in sequence:\n');
    
    // Step 1: Create the game
    console.log('// STEP 1: Create Science Game');
    console.log(`fetch('http://localhost:1337/api/games', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    data: {
      name: "${GAME_NAME}",
      description: "Test your knowledge of science across multiple disciplines including physics, chemistry, biology, astronomy, and environmental science.",
      type: "nested",
      status: "free",
      isActive: true,
      sortOrder: 1
    } 
  })
}).then(r => r.json()).then(data => {
  console.log('✅ Game created:', data);
  window.scienceGameId = data.data.id;
  console.log('🎯 Game ID stored:', window.scienceGameId);
}).catch(console.error);
`);
    
    // Step 2: Create categories
    console.log('\n// STEP 2: Create Categories (run after Step 1 completes)');
    sheetNames.forEach((categoryName, index) => {
      console.log(`fetch('http://localhost:1337/api/categories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    data: {
      name: "${categoryName}",
      status: "free",
      cardNumber: ${index + 1},
      isActive: true,
      sortOrder: ${index + 1},
      game: window.scienceGameId
    } 
  })
}).then(r => r.json()).then(data => {
  console.log('✅ Category created:', data);
  window['${categoryName.toLowerCase().replace(/\s+/g, '')}CategoryId'] = data.data.id;
}).catch(console.error);
`);
    });
    
    // Step 3: Process questions for each category
    console.log('\n// STEP 3: Create Questions (run after Step 2 completes)');
    
    let totalQuestions = 0;
    sheetNames.forEach(categoryName => {
      const worksheet = workbook.Sheets[categoryName];
      const questions = XLSX.utils.sheet_to_json(worksheet);
      
      console.log(`\n// Questions for ${categoryName} (${questions.length} questions)`);
      
      questions.forEach((q, qIndex) => {
        totalQuestions++;
        const categoryVar = categoryName.toLowerCase().replace(/\s+/g, '');
        
        console.log(`// ${categoryName} - Question ${qIndex + 1}`);
        console.log(`fetch('http://localhost:1337/api/questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    data: {
      questionText: "${q['Question Text']?.replace(/"/g, '\\"') || 'Missing question text'}",
      optionA: "${q['Option A']?.replace(/"/g, '\\"') || 'Option A'}",
      optionB: "${q['Option B']?.replace(/"/g, '\\"') || 'Option B'}",
      optionC: "${q['Option C']?.replace(/"/g, '\\"') || 'Option C'}",
      optionD: "${q['Option D']?.replace(/"/g, '\\"') || 'Option D'}",
      correctAnswer: "${q['Correct Answer'] || 'A'}",
      isActive: true,
      sortOrder: ${qIndex + 1},
      game: window.scienceGameId,
      category: window['${categoryVar}CategoryId']
    } 
  })
}).then(r => r.json()).then(data => {
  console.log('✅ Question created:', data.data.questionText.substring(0, 50) + '...');
}).catch(console.error);
`);
      });
    });
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`- Game Type: ${GAME_TYPE}`);
    console.log(`- Categories: ${sheetNames.length}`);
    console.log(`- Total Questions: ${totalQuestions}`);
    console.log(`- Structure: Nested (questions organized by category cards)`);
    
    console.log(`\n🎯 EXECUTION ORDER:`);
    console.log(`1. Run STEP 1 (create game) - wait for completion`);
    console.log(`2. Run STEP 2 (create categories) - wait for completion`);
    console.log(`3. Run STEP 3 (create questions) - can run all at once`);
    
    console.log(`\n🔧 TROUBLESHOOTING:`);
    console.log(`If you get permission errors:`);
    console.log(`1. Go to http://localhost:1337/admin`);
    console.log(`2. Settings > Users & Permissions > Roles`);
    console.log(`3. Enable permissions for Public/Authenticated roles`);
    console.log(`4. NO API TOKENS NEEDED for basic operations!`);
    
  } catch (error) {
    console.error('❌ Error during nested game import:', error);
  }
}

// Install XLSX if not available
try {
  require('xlsx');
} catch (e) {
  console.log('📦 Installing XLSX package...');
  const { execSync } = require('child_process');
  execSync('npm install xlsx', { stdio: 'inherit' });
  console.log('✅ XLSX package installed');
}

importNestedGameQuestions(); 