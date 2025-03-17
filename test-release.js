#!/usr/bin/env node

/**
 * This script helps test semantic-release locally
 * It runs semantic-release in dry-run mode to verify the configuration
 */

const { execSync } = require('child_process');

console.log('Testing semantic-release configuration...');

try {
  // Run semantic-release in dry-run mode with GitHub verification disabled
  const output = execSync('npx semantic-release --dry-run --verify-conditions=@semantic-release/changelog,@semantic-release/npm,@semantic-release/git', { 
    stdio: 'pipe',
    encoding: 'utf-8',
    env: {
      ...process.env,
      CI: 'true' // Some tools behave differently in CI environments
    }
  });
  
  console.log('Semantic Release Dry Run Output:');
  console.log(output);
  console.log('Configuration test completed successfully.');
} catch (error) {
  console.error('Error testing semantic-release configuration:');
  console.error(error.stdout || error.message);
  
  // Provide more helpful error messages based on common issues
  if (error.stdout?.includes('ENOAUTH') || error.stdout?.includes('401')) {
    console.error('\nAuthentication Error: The provided GitHub token may be invalid or expired.');
    console.error('Please check your token and ensure it has the necessary permissions.');
  }
  
  process.exit(1);
} 