const fs = require('fs');
const path = require('path');

async function seedScienceGame() {
  console.log('🧪 Creating Science Game seed data...');
  
  try {
    // Science Game data
    const scienceGame = {
      name: 'Science Game',
      description: 'Test your knowledge of science across multiple disciplines including physics, chemistry, biology, astronomy, and environmental science.',
      type: 'nested',
      status: 'free',
      isActive: true,
      sortOrder: 1
    };
    
    // Categories for Science Game (5 categories as requested)
    const categories = [
      {
        name: 'Physics',
        status: 'free',
        cardNumber: 1,
        isActive: true,
        sortOrder: 1
      },
      {
        name: 'Chemistry',
        status: 'free',
        cardNumber: 2,
        isActive: true,
        sortOrder: 2
      },
      {
        name: 'Biology',
        status: 'free',
        cardNumber: 3,
        isActive: true,
        sortOrder: 3
      },
      {
        name: 'Astronomy',
        status: 'free',
        cardNumber: 4,
        isActive: true,
        sortOrder: 4
      },
      {
        name: 'Environmental Science',
        status: 'free',
        cardNumber: 5,
        isActive: true,
        sortOrder: 5
      }
    ];
    
    // Sample questions for each category
    const sampleQuestions = {
      'Physics': [
        {
          questionText: 'What is the speed of light in vacuum?',
          optionA: '299,792,458 m/s',
          optionB: '300,000,000 m/s',
          optionC: '186,000 miles/s',
          optionD: 'All of the above are approximately correct',
          correctAnswer: 'D',
          isActive: true,
          sortOrder: 1
        },
        {
          questionText: 'What is Newton\'s second law of motion?',
          optionA: 'F = ma',
          optionB: 'E = mc²',
          optionC: 'v = u + at',
          optionD: 'P = mv',
          correctAnswer: 'A',
          isActive: true,
          sortOrder: 2
        }
      ],
      'Chemistry': [
        {
          questionText: 'What is the chemical symbol for gold?',
          optionA: 'Au',
          optionB: 'Ag',
          optionC: 'Go',
          optionD: 'Gd',
          correctAnswer: 'A',
          isActive: true,
          sortOrder: 1
        },
        {
          questionText: 'What is the pH of pure water at 25°C?',
          optionA: '6',
          optionB: '7',
          optionC: '8',
          optionD: '9',
          correctAnswer: 'B',
          isActive: true,
          sortOrder: 2
        }
      ],
      'Biology': [
        {
          questionText: 'What is the powerhouse of the cell?',
          optionA: 'Nucleus',
          optionB: 'Ribosome',
          optionC: 'Mitochondria',
          optionD: 'Golgi apparatus',
          correctAnswer: 'C',
          isActive: true,
          sortOrder: 1
        },
        {
          questionText: 'How many chambers does a human heart have?',
          optionA: '2',
          optionB: '3',
          optionC: '4',
          optionD: '5',
          correctAnswer: 'C',
          isActive: true,
          sortOrder: 2
        }
      ],
      'Astronomy': [
        {
          questionText: 'What planet is known as the Red Planet?',
          optionA: 'Venus',
          optionB: 'Mars',
          optionC: 'Jupiter',
          optionD: 'Saturn',
          correctAnswer: 'B',
          isActive: true,
          sortOrder: 1
        },
        {
          questionText: 'What is the closest star to Earth?',
          optionA: 'Alpha Centauri',
          optionB: 'Sirius',
          optionC: 'The Sun',
          optionD: 'Proxima Centauri',
          correctAnswer: 'C',
          isActive: true,
          sortOrder: 2
        }
      ],
      'Environmental Science': [
        {
          questionText: 'What gas makes up approximately 78% of Earth\'s atmosphere?',
          optionA: 'Oxygen',
          optionB: 'Carbon dioxide',
          optionC: 'Nitrogen',
          optionD: 'Argon',
          correctAnswer: 'C',
          isActive: true,
          sortOrder: 1
        },
        {
          questionText: 'What is the greenhouse effect?',
          optionA: 'Cooling of Earth\'s surface',
          optionB: 'Warming of Earth\'s surface due to trapped heat',
          optionC: 'Formation of clouds',
          optionD: 'Ocean currents',
          correctAnswer: 'B',
          isActive: true,
          sortOrder: 2
        }
      ]
    };
    
    console.log('\n🚀 API calls to create Science Game structure:');
    console.log('Copy and paste these into your browser console or API tool:\n');
    
    // 1. Create the game
    console.log('// 1. Create Science Game');
    console.log(`fetch('http://localhost:1337/api/games', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: ${JSON.stringify(scienceGame, null, 4)} })
}).then(r => r.json()).then(data => {
  console.log('Game created:', data);
  const gameId = data.data.id;
  
  // Store gameId for next steps
  window.scienceGameId = gameId;
}).catch(console.error);
`);
    
    console.log('\n// 2. Create Categories (run after game creation)');
    categories.forEach((category, index) => {
      console.log(`// Category ${index + 1}: ${category.name}`);
      console.log(`fetch('http://localhost:1337/api/categories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    data: { 
      ...${JSON.stringify(category, null, 6)},
      game: window.scienceGameId 
    } 
  })
}).then(r => r.json()).then(data => {
  console.log('Category created:', data);
  window['${category.name.toLowerCase()}CategoryId'] = data.data.id;
}).catch(console.error);
`);
    });
    
    console.log('\n// 3. Create Sample Questions (run after categories creation)');
    Object.keys(sampleQuestions).forEach(categoryName => {
      const questions = sampleQuestions[categoryName];
      const categoryVar = categoryName.toLowerCase().replace(/\s+/g, '');
      
      questions.forEach((question, qIndex) => {
        console.log(`// ${categoryName} Question ${qIndex + 1}`);
        console.log(`fetch('http://localhost:1337/api/questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    data: { 
      ...${JSON.stringify(question, null, 6)},
      game: window.scienceGameId,
      category: window['${categoryVar}CategoryId']
    } 
  })
}).then(r => r.json()).then(console.log).catch(console.error);
`);
      });
    });
    
    console.log('\n📁 Alternative: Direct PostgreSQL commands');
    console.log('If you have direct database access:\n');
    
    console.log(`-- 1. Insert Science Game`);
    console.log(`INSERT INTO games (name, description, type, status, is_active, sort_order, created_at, updated_at) VALUES ('${scienceGame.name}', '${scienceGame.description}', '${scienceGame.type}', '${scienceGame.status}', ${scienceGame.isActive}, ${scienceGame.sortOrder}, NOW(), NOW());`);
    
    console.log(`\n-- 2. Insert Categories (replace GAME_ID with actual game ID)`);
    categories.forEach(category => {
      console.log(`INSERT INTO categories (name, status, card_number, is_active, sort_order, game, created_at, updated_at) VALUES ('${category.name}', '${category.status}', ${category.cardNumber}, ${category.isActive}, ${category.sortOrder}, GAME_ID, NOW(), NOW());`);
    });
    
    console.log(`\n✅ Science Game seed data prepared!`);
    console.log(`📝 Next steps:`);
    console.log(`1. Run the API calls above to create the game structure`);
    console.log(`2. Use the bulk import script with your Excel file for questions`);
    console.log(`3. Or use the direct SQL commands if you have database access`);
    
  } catch (error) {
    console.error('❌ Error creating seed data:', error);
  }
}

seedScienceGame(); 