import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';
import { addGamificationTables } from './migrations/add-gamification';
import { seedAchievements } from './seed/achievements';
import * as fs from 'fs';
import * as path from 'path';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

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
    
    // Run custom migrations
    await addGamificationTables();
    
    // Seed data
    await seedAchievements();
    
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