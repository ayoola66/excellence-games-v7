#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Define the expected structure
const EXPECTED_STRUCTURE = {
  apps: {
    frontend: {
      public: {
        images: {},
        audio: {}
      }
    },
    backend: {
      public: {
        uploads: {},
        data: {}
      }
    }
  },
  docs: {
    implementation: {},
    setup: {},
    testing: {}
  },
  tests: {
    'e2e': {},
    'test-results': {},
    'playwright-report': {}
  },
  scripts: {}
};

// Define protected files that should never be deleted
const PROTECTED_FILES = [
  '.editorconfig',
  '.gitignore',
  'package.json',
  'README.md',
  'scripts/enforce-structure.js'
];

// Define allowed file extensions in each directory
const ALLOWED_EXTENSIONS = {
  'apps/frontend/public/images': ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
  'apps/frontend/public/audio': ['.mp3', '.wav', '.ogg'],
  'apps/backend/public/data': ['.json', '.csv', '.xlsx'],
  'docs/implementation': ['.md'],
  'docs/setup': ['.md'],
  'docs/testing': ['.md'],
  'tests/e2e': ['.ts', '.js', '.tsx', '.jsx'],
  'scripts': ['.js', '.sh', '.bat']
};

function validateStructure(basePath, expectedStructure, currentPath = '') {
  const issues = [];

  // Check if the current directory exists
  const fullPath = path.join(basePath, currentPath);
  if (!fs.existsSync(fullPath)) {
    issues.push(`Missing directory: ${currentPath || '/'}`);
    return issues;
  }

  // Get the contents of the current directory
  const contents = fs.readdirSync(fullPath);

  // Check for unexpected items in the current directory
  contents.forEach(item => {
    const itemPath = path.join(fullPath, item);
    const relativePath = path.join(currentPath, item);
    
    // Skip protected files and node_modules
    if (PROTECTED_FILES.includes(item) || item === 'node_modules' || item.startsWith('.')) {
      return;
    }

    // Check file extensions
    if (fs.statSync(itemPath).isFile()) {
      const ext = path.extname(item).toLowerCase();
      const dirPath = currentPath || '/';
      
      if (ALLOWED_EXTENSIONS[dirPath] && !ALLOWED_EXTENSIONS[dirPath].includes(ext)) {
        issues.push(`Invalid file type ${ext} in ${dirPath}: ${item}`);
      }
    }
  });

  // Recursively check subdirectories
  Object.keys(expectedStructure).forEach(dir => {
    const newPath = path.join(currentPath, dir);
    const subIssues = validateStructure(
      basePath,
      expectedStructure[dir],
      newPath
    );
    issues.push(...subIssues);
  });

  return issues;
}

function enforceStructure() {
  const rootDir = process.cwd();
  console.log(chalk.blue('🔍 Checking project structure...'));

  const issues = validateStructure(rootDir, EXPECTED_STRUCTURE);

  if (issues.length === 0) {
    console.log(chalk.green('✅ Project structure is valid!'));
    return true;
  } else {
    console.log(chalk.red('❌ Project structure issues found:'));
    issues.forEach(issue => {
      console.log(chalk.yellow(`  - ${issue}`));
    });
    return false;
  }
}

// Run the check
if (require.main === module) {
  const isValid = enforceStructure();
  process.exit(isValid ? 0 : 1);
}

module.exports = enforceStructure; 