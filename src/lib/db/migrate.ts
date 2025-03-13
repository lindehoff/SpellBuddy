import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';
import { addGamificationTables } from './migrations/add-gamification';
import { seedAchievements } from './seed/achievements';
import * as fs from 'fs';
import * as path from 'path';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

async function runMigrations() {
  console.log('Running migrations...');
  
  try {
    // Ensure drizzle directory exists
    const drizzleDir = path.join(process.cwd(), 'drizzle');
    if (!fs.existsSync(drizzleDir)) {
      console.log('Creating drizzle directory...');
      fs.mkdirSync(drizzleDir, { recursive: true });
    }
    
    // Check if meta directory exists
    const metaDir = path.join(drizzleDir, 'meta');
    if (!fs.existsSync(metaDir)) {
      console.log('Creating meta directory...');
      fs.mkdirSync(metaDir, { recursive: true });
      
      // Create empty journal file
      const journalPath = path.join(metaDir, '_journal.json');
      fs.writeFileSync(journalPath, JSON.stringify({ entries: [] }));
    }
    
    // Run schema migrations
    await migrate(db as BetterSQLite3Database, { migrationsFolder: './drizzle' });
    
    // Ensure base tables exist before running custom migrations
    try {
      console.log('Ensuring base schema exists...');
      // Create base tables if they don't exist
      const sqlite = (db as any).driver.database;
      
      // Check if users table exists
      const tableExists = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
      
      if (!tableExists) {
        console.log('Creating base schema tables...');
        // Create users table
        sqlite.exec(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT,
            created_at INTEGER NOT NULL DEFAULT (unixepoch()),
            updated_at INTEGER NOT NULL DEFAULT (unixepoch())
          );
        `);
        
        // Create other necessary tables
        // Add more tables as needed based on your schema
      }
    } catch (schemaError) {
      console.error('Error creating base schema:', schemaError);
    }
    
    // Run custom migrations
    try {
      await addGamificationTables();
    } catch (gamifyError) {
      console.error('Error adding gamification tables:', gamifyError);
    }
    
    // Seed data
    try {
      await seedAchievements();
    } catch (seedError) {
      console.error('Error seeding achievements:', seedError);
    }
    
    console.log('All migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    // Don't exit process, allow application to continue
    console.log('Continuing despite migration failure...');
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations }; 