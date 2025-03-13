import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import * as fs from 'fs';
import * as path from 'path';

// Define database path - use data directory in production
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/app/data/sqlite.db'
  : 'sqlite.db';

// Ensure the directory exists in production
if (process.env.NODE_ENV === 'production') {
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

// Initialize SQLite database
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Export schema for use in other files
export { schema }; 