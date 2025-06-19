#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const excludeDirs = ['node_modules', '.next', 'out', 'build', 'dist', 'backup'];
const fileExtensions = ['.tsx', '.ts', '.jsx', '.js'];

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

// Counter for statistics
const stats = {
  filesScanned: 0,
  filesModified: 0,
  importLinesReplaced: 0,
  toastCallsReplaced: 0
};

/**
 * Check if a directory should be excluded
 */
function shouldExcludeDir(dirPath) {
  const dirName = path.basename(dirPath);
  return excludeDirs.includes(dirName) || dirName.startsWith('.');
}

/**
 * Check if a file should be processed
 */
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  return fileExtensions.includes(ext);
}

/**
 * Process a file to replace toast imports and usages
 */
function processFile(filePath) {
  try {
    stats.filesScanned++;
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace import statements
    const importRegex = /import\s+(?:{\s*)?toast(?:\s*(?:,|\}))?.*?from\s+['"]react-hot-toast['"];?/g;
    const newImport = "import compatToast from '@/lib/notificationManager';";
    
    // Check if the file already has our notification manager import
    if (content.includes("from '@/lib/notificationManager'")) {
      return;
    }
    
    // Replace import statements
    content = content.replace(importRegex, newImport);
    
    // Replace toast function calls
    const toastCallRegex = /toast\.(success|error|warning|info|loading|custom|dismiss|remove)\(/g;
    content = content.replace(toastCallRegex, 'compatToast.$1(');
    
    // Replace plain toast calls
    const plainToastRegex = /(?<!\.)toast\(/g;
    content = content.replace(plainToastRegex, 'compatToast(');
    
    // Count replacements for statistics
    const importReplacements = (originalContent.match(importRegex) || []).length;
    const toastCallReplacements = 
      ((originalContent.match(toastCallRegex) || []).length) + 
      ((originalContent.match(plainToastRegex) || []).length);
    
    // Update statistics
    stats.importLinesReplaced += importReplacements;
    stats.toastCallsReplaced += toastCallReplacements;
    
    // Write back to file if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.filesModified++;
      console.log(`${colors.green}✓${colors.reset} Updated: ${colors.blue}${path.relative(rootDir, filePath)}${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error processing ${filePath}:${colors.reset}`, error);
  }
}

/**
 * Recursively process all files in a directory
 */
function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      if (!shouldExcludeDir(fullPath)) {
        processDirectory(fullPath);
      }
    } else if (entry.isFile() && shouldProcessFile(fullPath)) {
      processFile(fullPath);
    }
  }
}

/**
 * Main function
 */
function main() {
  console.log(`${colors.blue}Starting toast import replacement...${colors.reset}`);
  console.log(`${colors.yellow}Root directory:${colors.reset} ${rootDir}`);
  
  // Process all files
  processDirectory(rootDir);
  
  // Print statistics
  console.log('\n=== Statistics ===');
  console.log(`${colors.blue}Files scanned:${colors.reset} ${stats.filesScanned}`);
  console.log(`${colors.green}Files modified:${colors.reset} ${stats.filesModified}`);
  console.log(`${colors.yellow}Import lines replaced:${colors.reset} ${stats.importLinesReplaced}`);
  console.log(`${colors.yellow}Toast calls replaced:${colors.reset} ${stats.toastCallsReplaced}`);
  console.log('\nDone! 🎉');
}

// Run the script
main(); 