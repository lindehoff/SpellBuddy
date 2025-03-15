#!/usr/bin/env node

/**
 * This script helps test semantic-release locally
 * It runs semantic-release in dry-run mode to verify the configuration
 */

const { execSync } = require('child_process');

console.log('Testing semantic-release configuration...');

try {
  // Run semantic-release in dry-run mode
  const output = execSync('npx semantic-release --dry-run --no-ci', { 
    stdio: 'pipe',
    encoding: 'utf-8'
  });
  
  console.log('Semantic Release Dry Run Output:');
  console.log(output);
  console.log('Configuration test completed successfully.');
} catch (error) {
  console.error('Error testing semantic-release configuration:');
  console.error(error.stdout || error.message);
  process.exit(1);
} 