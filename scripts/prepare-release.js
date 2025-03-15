#!/usr/bin/env node

/**
 * Prepare Release Script
 * 
 * This script helps prepare for a release by:
 * 1. Checking that all tests pass
 * 2. Verifying that the achievement system is working
 * 3. Testing the semantic-release configuration
 * 4. Providing guidance on creating a proper release commit
 * 
 * Usage:
 *   node scripts/prepare-release.js
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('🚀 Preparing for Release');
  console.log('=======================\n');

  try {
    // 1. Check git status
    console.log('Checking git status...');
    const gitStatus = execSync('git status --porcelain').toString();
    
    if (gitStatus.trim()) {
      console.log('⚠️ You have uncommitted changes:');
      console.log(gitStatus);
      
      const proceed = await prompt('Do you want to continue anyway? (y/N): ');
      if (proceed.toLowerCase() !== 'y') {
        console.log('Exiting. Please commit your changes before preparing for release.');
        process.exit(0);
      }
    } else {
      console.log('✅ Git working directory is clean');
    }

    // 2. Run tests
    console.log('\nRunning tests...');
    try {
      execSync('npm test', { stdio: 'inherit' });
      console.log('✅ All tests passed');
    } catch (error) {
      console.error('❌ Tests failed. Please fix the failing tests before proceeding.');
      process.exit(1);
    }

    // 3. Check achievement system
    console.log('\nChecking achievement system...');
    try {
      execSync('npm run test-achievements', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Achievement system check failed.');
      process.exit(1);
    }

    // 4. Test semantic-release configuration
    console.log('\nTesting semantic-release configuration...');
    try {
      execSync('npm run test-release', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ semantic-release configuration test failed.');
      process.exit(1);
    }

    // 5. Provide guidance on creating a release commit
    console.log('\n✅ All checks passed! You are ready to create a release commit.');
    console.log('\nTo create a release commit, use one of the following commit types:');
    console.log('  - fix: for bug fixes (triggers a PATCH release)');
    console.log('  - feat: for new features (triggers a MINOR release)');
    console.log('  - feat!: or feat: with BREAKING CHANGE footer (triggers a MAJOR release)');
    console.log('\nExample commit messages:');
    console.log('  - fix: correct achievement unlocking logic');
    console.log('  - feat: add new achievement types');
    console.log('  - feat!: redesign achievement system\n');
    console.log('  - feat: add new user interface\n    BREAKING CHANGE: completely redesigns the UI');
    
    console.log('\nYou can use the npm run commit command to create a properly formatted commit.');
    
    // 6. Ask if they want to create a commit now
    const createCommit = await prompt('\nDo you want to create a commit now? (y/N): ');
    if (createCommit.toLowerCase() === 'y') {
      execSync('npm run commit', { stdio: 'inherit' });
    } else {
      console.log('\nWhen you are ready, create your commit and push to the main branch.');
      console.log('The GitHub Actions workflow will automatically create a release.');
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main(); 