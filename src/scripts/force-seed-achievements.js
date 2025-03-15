#!/usr/bin/env node

/**
 * This is a wrapper script to run the TypeScript force-seed-achievements script
 * It can be executed directly from the command line
 */

const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Running force seed achievements script...');
  
  // Get the path to the TypeScript script
  const scriptPath = path.join(__dirname, 'force-seed-achievements.ts');
  
  // Execute the TypeScript script using tsx (which is already installed)
  execSync(`npx tsx ${scriptPath}`, { stdio: 'inherit' });
  
  console.log('Script completed successfully.');
} catch (error) {
  console.error('Error running script:', error.message);
  process.exit(1);
} 