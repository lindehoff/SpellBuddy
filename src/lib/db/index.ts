import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import * as fs from 'fs';
import * as path from 'path';

// Define database path - use data directory in production
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/app/data/sqlite.db'
  : 'sqlite.db';

// Initialize SQLite database
let db;
try {
  const sqlite = new Database(dbPath);
  db = drizzle(sqlite, { schema });
} catch (error) {
  console.error(`Error initializing database at ${dbPath}:`, error);
  // Fallback to in-memory database if we can't access the file
  if (process.env.NODE_ENV === 'production') {
    console.warn('Falling back to in-memory database. Data will not be persisted!');
    const sqlite = new Database(':memory:');
    db = drizzle(sqlite, { schema });
  } else {
    throw error; // Re-throw in development
  }
}

// Export database and schema
export { db, schema }; 