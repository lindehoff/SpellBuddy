import { checkAndUpdateDatabase } from '../lib/db/init';

/**
 * This script checks and updates the database with any missing achievements
 * It can be run manually if needed
 */
async function main() {
  console.log('Checking and updating achievements...');
  
  try {
    await checkAndUpdateDatabase();
    console.log('Database update completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating database:', error);
    process.exit(1);
  }
}

// Run the script
main(); 