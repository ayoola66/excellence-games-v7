#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CONTEXT_SECTIONS = {
  rules: ['development-guidelines', 'project-structure', 'testing', 'database', 'typescript', 'british-english'],
  tdd: ['testing', 'tdd-workflow', 'coverage'],
  db: ['database', 'strapi', 'api'],
  ts: ['typescript', 'error-handling', 'code-style']
};

const CONTEXT_FILES = {
  'development-guidelines': 'DEVELOPMENT-GUIDELINES.md',
  'ai-rules': 'AI-ASSISTANT-RULES.md',
  'ai-shortcuts': 'AI-SHORTCUTS.md'
};

/**
 * Processes AI context shortcuts in a message
 * @param {string} message - The input message with shortcuts
 * @returns {string} - The expanded message with full context
 */
function processShortcuts(message) {
  const shortcuts = message.match(/@(rules|tdd|db|ts|all)\b/gi) || [];
  if (shortcuts.length === 0) return message;

  const uniqueShortcuts = [...new Set(shortcuts.map(s => s.toLowerCase()))];
  let context = '';

  // If @all is present, include everything
  if (uniqueShortcuts.includes('@all')) {
    context = loadFullContext();
  } else {
    // Process individual shortcuts
    uniqueShortcuts.forEach(shortcut => {
      const type = shortcut.substring(1); // Remove @
      if (CONTEXT_SECTIONS[type]) {
        context += loadContextForSections(CONTEXT_SECTIONS[type]);
      }
    });
  }

  // Replace shortcuts with empty string and prepend context
  const cleanMessage = message.replace(/@(rules|tdd|db|ts|all)\b/gi, '').trim();
  return `${context}\n\n${cleanMessage}`;
}

/**
 * Loads the full context from all files
 */
function loadFullContext() {
  const workspaceRoot = process.cwd();
  let context = '';

  Object.values(CONTEXT_FILES).forEach(file => {
    const filePath = path.join(workspaceRoot, 'docs', 'implementation', file);
    if (fs.existsSync(filePath)) {
      context += fs.readFileSync(filePath, 'utf8') + '\n\n';
    }
  });

  return context;
}

/**
 * Loads context for specific sections
 */
function loadContextForSections(sections) {
  const workspaceRoot = process.cwd();
  let context = '';

  sections.forEach(section => {
    const filePath = path.join(workspaceRoot, '.ai-context', `${section}.md`);
    if (fs.existsSync(filePath)) {
      context += fs.readFileSync(filePath, 'utf8') + '\n\n';
    }
  });

  return context;
}

// If running as script
if (require.main === module) {
  const input = process.argv[2] || '';
  const output = processShortcuts(input);
  console.log(output);
}

module.exports = { processShortcuts }; 