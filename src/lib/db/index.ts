import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Initialize SQLite database
const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite, { schema });

// Export schema for use in other files
export { schema }; 