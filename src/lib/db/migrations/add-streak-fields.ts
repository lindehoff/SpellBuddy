import { sql } from 'drizzle-orm';
import { db } from '..';

export async function addStreakFields() {
  console.log('Running migration: Adding streak fields to users table');
  
  try {
    // Add the columns, ignoring errors if they already exist
    try {
      await db.run(sql`ALTER TABLE users ADD COLUMN current_streak INTEGER NOT NULL DEFAULT 0`);
      console.log('Added current_streak column to users table');
    } catch (_e) { // eslint-disable-line @typescript-eslint/no-unused-vars
      console.log('current_streak column might already exist, continuing...');
    }
    
    try {
      await db.run(sql`ALTER TABLE users ADD COLUMN longest_streak INTEGER NOT NULL DEFAULT 0`);
      console.log('Added longest_streak column to users table');
    } catch (_e) { // eslint-disable-line @typescript-eslint/no-unused-vars
      console.log('longest_streak column might already exist, continuing...');
    }
    
    try {
      await db.run(sql`ALTER TABLE users ADD COLUMN last_activity_date INTEGER`);
      console.log('Added last_activity_date column to users table');
    } catch (_e) { // eslint-disable-line @typescript-eslint/no-unused-vars
      console.log('last_activity_date column might already exist, continuing...');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
} 