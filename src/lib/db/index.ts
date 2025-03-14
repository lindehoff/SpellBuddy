import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import * as fs from 'fs';
import * as path from 'path';
import { DrizzleDB } from './types';

// Define database path - use DATABASE_URL if set, otherwise use default paths
let dbPath: string;
if (process.env.DATABASE_URL) {
  // Extract the file path from the DATABASE_URL
  const fileUrl = process.env.DATABASE_URL;
  console.log('Using DATABASE_URL:', fileUrl);
  if (fileUrl.startsWith('file:')) {
    dbPath = fileUrl.substring(5); // Remove 'file:' prefix
  } else {
    dbPath = fileUrl;
  }
} else {
  // Use default paths
  dbPath = process.env.NODE_ENV === 'production' 
    ? '/app/data/sqlite.db'
    : 'sqlite.db';
}

console.log('Database path resolved to:', dbPath);

// Initialize SQLite database
let db: DrizzleDB;
try {
  // Try to open the database file
  const sqlite = new Database(dbPath, { verbose: console.log });
  
  // Test if we can write to the database
  sqlite.exec('PRAGMA journal_mode = WAL;');
  
  db = drizzle(sqlite, { schema }) as DrizzleDB;
  console.log(`Successfully connected to database at ${dbPath}`);
} catch (error) {
  console.error(`Error initializing database at ${dbPath}:`, error);
  // Fallback to in-memory database if we can't access the file
  console.warn('Falling back to in-memory database. Data will not be persisted!');
  try {
    const sqlite = new Database(':memory:');
    db = drizzle(sqlite, { schema }) as DrizzleDB;
    
    // Create tables in memory
    console.log('Creating tables in memory database...');
    sqlite.exec(`
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = WAL;
    `);
  } catch (memError) {
    console.error('Failed to create in-memory database:', memError);
    throw memError;
  }
}

// Export database and schema
export { db, schema }; 