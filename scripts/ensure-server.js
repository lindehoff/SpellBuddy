#!/usr/bin/env node

/**
 * Ensure Server Script
 * 
 * This script checks if the SpellBuddy server is running on port 3000.
 * If not, it starts the development server.
 * 
 * Usage:
 *   node scripts/ensure-server.js
 */

const { execSync, spawn } = require('child_process');
const http = require('http');

function isServerRunning() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      resolve(true);
      req.destroy();
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log('Checking if SpellBuddy server is running...');
  
  const running = await isServerRunning();
  
  if (running) {
    console.log('✅ Server is already running on http://localhost:3000');
    return;
  }
  
  console.log('Server is not running. Starting development server...');
  
  // Start the server in a detached process
  const server = spawn('npm', ['run', 'dev'], {
    detached: true,
    stdio: 'inherit'
  });
  
  // Unref the child process so it can run independently
  server.unref();
  
  console.log('⏳ Waiting for server to start...');
  
  // Wait for the server to start (max 30 seconds)
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const running = await isServerRunning();
    
    if (running) {
      console.log('✅ Server started successfully on http://localhost:3000');
      return;
    }
    
    attempts++;
    if (attempts % 5 === 0) {
      console.log(`Still waiting... (${attempts}/${maxAttempts})`);
    }
  }
  
  console.error('❌ Server failed to start within the timeout period');
  process.exit(1);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 