import { db } from '../lib/db/index';
import { achievements } from '../lib/db/schema';
import { seedAchievements } from '../lib/db/seed/achievements';
import { sql } from 'drizzle-orm';

/**
 * This script forces seeding of achievements by clearing the table first
 * It can be run manually if achievements are not showing up
 */
async function main() {
  console.log('Force seeding achievements...');
  
  try {
    // Clear the achievements table
    console.log('Clearing achievements table...');
    await db.delete(achievements);
    
    // Seed achievements
    console.log('Seeding achievements...');
    await seedAchievements();
    
    // Verify achievements were seeded
    const result = await db.select({ count: sql<number>`count(*)` }).from(achievements);
    console.log(`Successfully seeded ${result[0]?.count || 0} achievements.`);
    
    console.log('Force seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error force seeding achievements:', error);
    process.exit(1);
  }
}

// Run the script
main(); 