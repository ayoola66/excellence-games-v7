const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Simple Strapi bootstrap without using createStrapi
async function importQuestions() {
  console.log('📚 Starting bulk question import...');
  
  // Configuration
  const GAME_NAME = 'Science Game'; // Change this to your target game
  const EXCEL_FILE = 'questions.xlsx'; // Place your Excel file in the scripts folder
  const SHEET_NAME = 'Questions'; // Sheet name in Excel file
  
  try {
    // Check if Excel file exists
    const filePath = path.join(__dirname, EXCEL_FILE);
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Excel file ${EXCEL_FILE} not found in scripts folder`);
      console.log('📋 Creating sample Excel template...');
      
      // Create sample template
      const sampleData = [
        {
          'Question Text': 'What is the chemical symbol for gold?',
          'Option A': 'Au',
          'Option B': 'Ag',
          'Option C': 'Go',
          'Option D': 'Gd',
          'Correct Answer': 'A',
          'Category': 'Chemistry',
          'Difficulty': 'medium'
        },
        {
          'Question Text': 'What planet is known as the Red Planet?',
          'Option A': 'Venus',
          'Option B': 'Mars',
          'Option C': 'Jupiter',
          'Option D': 'Saturn',
          'Correct Answer': 'B',
          'Category': 'Astronomy',
          'Difficulty': 'easy'
        },
        {
          'Question Text': 'What is the speed of light in vacuum?',
          'Option A': '299,792,458 m/s',
          'Option B': '300,000,000 m/s',
          'Option C': '186,000 miles/s',
          'Option D': 'All of the above are approximately correct',
          'Correct Answer': 'D',
          'Category': 'Physics',
          'Difficulty': 'hard'
        }
      ];
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(sampleData);
      XLSX.utils.book_append_sheet(wb, ws, SHEET_NAME);
      XLSX.writeFile(wb, filePath);
      
      console.log(`✅ Sample template created: ${filePath}`);
      console.log('📝 Fill in your questions and run the script again');
      return;
    }
    
    // Read Excel file
    console.log(`📖 Reading ${EXCEL_FILE}...`);
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[SHEET_NAME];
    
    if (!worksheet) {
      console.log(`❌ Sheet "${SHEET_NAME}" not found in Excel file`);
      console.log('Available sheets:', Object.keys(workbook.Sheets));
      return;
    }
    
    const questions = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Found ${questions.length} questions to import`);
    
    // Generate API calls for bulk import
    console.log('\n🔧 Generated API calls for manual import:');
    console.log('Copy and paste these into your browser console or use a tool like Postman:\n');
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      const questionData = {
        questionText: q['Question Text'],
        optionA: q['Option A'],
        optionB: q['Option B'],
        optionC: q['Option C'],
        optionD: q['Option D'],
        correctAnswer: q['Correct Answer'],
        category: q['Category'] || 'General',
        difficulty: q['Difficulty'] || 'medium',
        isActive: true,
        sortOrder: i + 1
      };
      
      console.log(`// Question ${i + 1}: ${q['Question Text'].substring(0, 50)}...`);
      console.log(`fetch('http://localhost:1337/api/questions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    data: ${JSON.stringify(questionData, null, 4)}
  })
}).then(r => r.json()).then(console.log).catch(console.error);
`);
      console.log('');
    }
    
    console.log('\n📋 Alternative: Direct database import SQL');
    console.log('If you have direct database access, you can use these SQL inserts:\n');
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionText = q['Question Text'].replace(/'/g, "''");
      const optionA = q['Option A'].replace(/'/g, "''");
      const optionB = q['Option B'].replace(/'/g, "''");
      const optionC = q['Option C'].replace(/'/g, "''");
      const optionD = q['Option D'].replace(/'/g, "''");
      const category = (q['Category'] || 'General').replace(/'/g, "''");
      
      console.log(`INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, category, is_active, sort_order, created_at, updated_at) VALUES ('${questionText}', '${optionA}', '${optionB}', '${optionC}', '${optionD}', '${q['Correct Answer']}', '${q['Difficulty'] || 'medium'}', '${category}', true, ${i + 1}, NOW(), NOW());`);
    }
    
  } catch (error) {
    console.error('❌ Error during import:', error);
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

importQuestions(); 