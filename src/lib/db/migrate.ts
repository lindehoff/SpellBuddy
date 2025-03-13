import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';
import { addGamificationTables } from './migrations/add-gamification';
import { seedAchievements } from './seed/achievements';

async function runMigrations() {
  console.log('Running migrations...');
  
  try {
    // Run schema migrations
    await migrate(db, { migrationsFolder: './drizzle' });
    
    // Run custom migrations
    await addGamificationTables();
    
    // Seed data
    await seedAchievements();
    
    console.log('All migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations }; 