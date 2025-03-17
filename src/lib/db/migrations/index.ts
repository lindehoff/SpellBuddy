import { addStreakFields } from './add-streak-fields';

export async function runMigrations() {
  console.log('Running all migrations...');
  
  try {
    // Run migrations in sequence
    await addStreakFields();
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration process failed:', error);
    throw error;
  }
} 