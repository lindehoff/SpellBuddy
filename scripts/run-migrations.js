#!/usr/bin/env node

// This script runs database migrations directly using SQL

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

console.log('Starting database migrations...');

// Determine the database path
const dbPath = path.join(process.cwd(), 'spellbuddy.db');
console.log(`Using database at: ${dbPath}`);

try {
  // Connect to the database
  const db = new Database(dbPath);
  
  console.log('Connected to database');
  console.log('Running migrations...');
  
  // Add streak fields to users table
  console.log('Adding streak fields to users table...');
  
  // Check if columns exist before adding them
  const userTableInfo = db.prepare('PRAGMA table_info(users)').all();
  const columns = userTableInfo.map(col => col.name);
  
  // Add currentStreak column if it doesn't exist
  if (!columns.includes('current_streak')) {
    db.prepare('ALTER TABLE users ADD COLUMN current_streak INTEGER NOT NULL DEFAULT 0').run();
    console.log('Added current_streak column to users table');
  } else {
    console.log('current_streak column already exists');
  }
  
  // Add longestStreak column if it doesn't exist
  if (!columns.includes('longest_streak')) {
    db.prepare('ALTER TABLE users ADD COLUMN longest_streak INTEGER NOT NULL DEFAULT 0').run();
    console.log('Added longest_streak column to users table');
  } else {
    console.log('longest_streak column already exists');
  }
  
  // Add lastActivityDate column if it doesn't exist
  if (!columns.includes('last_activity_date')) {
    db.prepare('ALTER TABLE users ADD COLUMN last_activity_date INTEGER').run();
    console.log('Added last_activity_date column to users table');
  } else {
    console.log('last_activity_date column already exists');
  }
  
  console.log('All migrations completed successfully');
  
  // Close the database connection
  db.close();
} catch (error) {
  console.error('Migration process failed:', error);
  process.exit(1);
} 