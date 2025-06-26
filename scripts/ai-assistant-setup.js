#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Prepares AI assistant configuration by combining all relevant rules and guidelines
 */
function prepareAIContext() {
  const workspaceRoot = process.cwd();
  
  // Read the core files
  const aiRules = fs.readFileSync(
    path.join(workspaceRoot, 'docs/implementation/AI-ASSISTANT-RULES.md'),
    'utf8'
  );
  
  const devGuidelines = fs.readFileSync(
    path.join(workspaceRoot, 'docs/implementation/DEVELOPMENT-GUIDELINES.md'),
    'utf8'
  );

  // Combine the rules into a context message
  const contextMessage = `
# AI Assistant Configuration

## Project Rules and Guidelines

${aiRules}

## Development Guidelines

${devGuidelines}

## IMPORTANT REMINDER

These guidelines and rules MUST be followed for all code changes and suggestions.
No exceptions are allowed for:
- TDD requirements
- Database-first approach
- British English usage
- TypeScript strict mode
- Project structure
`;

  // Create output directory if it doesn't exist
  const outputDir = path.join(workspaceRoot, '.ai-context');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Save the combined context
  fs.writeFileSync(
    path.join(outputDir, 'ai-context.md'),
    contextMessage,
    'utf8'
  );

  console.log('AI context has been prepared successfully!');
  console.log('Location:', path.join(outputDir, 'ai-context.md'));
  console.log('\nTo use with AI assistants:');
  console.log('1. Start each conversation by asking the AI to read this file');
  console.log('2. Request the AI to confirm understanding of the rules');
  console.log('3. Proceed with your development tasks');
}

// Run the setup
try {
  prepareAIContext();
} catch (error) {
  console.error('Error preparing AI context:', error);
  process.exit(1);
} 