#!/usr/bin/env node

/**
 * This is a wrapper script to run the TypeScript force-seed-achievements script
 * It can be executed directly from the command line
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  console.log('Running force seed achievements script...');
  
  // Get the path to the TypeScript script
  const scriptPath = path.join(__dirname, 'force-seed-achievements.ts');
  
  // Execute the TypeScript script using tsx (which is already installed)
  execSync(`npx tsx ${scriptPath}`, { stdio: 'inherit' });
  
  console.log('Script completed successfully.');
} catch (error) {
  console.error('Error running script:', error instanceof Error ? error.message : String(error));
  process.exit(1);
} 