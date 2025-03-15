import { seedAchievements } from './seed/achievements';

/**
 * Initialize the database with required data
 * This function should be called after the database schema is created
 * It will seed the database with initial data like achievements
 */
export async function initializeDatabase() {
  console.log('Initializing database with required data...');
  
  try {
    // Seed achievements
    await seedAchievements();
    
    console.log('Database initialization completed successfully.');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

/**
 * Check if the database needs to be updated
 * This function checks if there are any achievements in the database
 * If not, it will seed the achievements
 */
export async function checkAndUpdateDatabase() {
  console.log('Checking if database needs updates...');
  
  try {
    // Check if achievements need to be seeded
    await seedAchievements();
    
    console.log('Database check completed.');
    return true;
  } catch (error) {
    console.error('Error checking database:', error);
    return false;
  }
} 