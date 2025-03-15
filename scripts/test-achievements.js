#!/usr/bin/env node

/**
 * Test Achievements Script
 * 
 * This script helps test the achievements system by:
 * 1. Counting the number of achievements in the database
 * 2. Making a request to the API endpoint to verify it returns all achievements
 * 3. Optionally unlocking achievements for testing purposes
 * 
 * Usage:
 *   node scripts/test-achievements.js [--unlock-random] [--ensure-server]
 *   
 * Options:
 *   --unlock-random: Unlocks a random set of achievements for testing display
 *   --ensure-server: Ensures the server is running before testing the API
 */

const { execSync, spawnSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');
const prisma = new PrismaClient();

async function main() {
  console.log('🏆 Testing Achievements System');
  console.log('==============================\n');

  try {
    // Check if we need to ensure the server is running
    if (process.argv.includes('--ensure-server')) {
      console.log('Ensuring server is running...');
      try {
        execSync('node scripts/ensure-server.js', { stdio: 'inherit' });
      } catch (error) {
        console.error('Failed to start server:', error.message);
        return;
      }
    }

    // 1. Count achievements in the database
    const achievementCount = await prisma.achievement.count();
    console.log(`Database contains ${achievementCount} achievements`);

    if (achievementCount === 0) {
      console.log('\n⚠️ No achievements found in database!');
      console.log('Try running: npx prisma db seed');
      return;
    }

    // 2. List achievement types for reference
    const types = await prisma.achievement.groupBy({
      by: ['type'],
      _count: true
    });

    console.log('\nAchievement types in database:');
    types.forEach(type => {
      console.log(`- ${type.type}: ${type._count} achievements`);
    });

    // 3. Test API endpoint
    console.log('\nTesting API endpoint...');
    try {
      // Check if server is running
      const serverRunning = checkServerRunning();
      
      if (!serverRunning) {
        console.log('⚠️ Server is not running. Start the server to test the API endpoint.');
        console.log('You can use the --ensure-server flag to automatically start the server.');
      } else {
        const response = await fetch('http://localhost:3000/api/achievements');
        const data = await response.json();
        
        console.log(`API returned ${data.achievements?.length || 0} achievements`);
        
        if (!data.achievements || data.achievements.length === 0) {
          console.log('⚠️ API returned 0 achievements! Check the API route implementation.');
        } else if (data.achievements.length !== achievementCount) {
          console.log(`⚠️ API returned ${data.achievements.length} achievements, but database has ${achievementCount}`);
        } else {
          console.log('✅ API is returning the correct number of achievements');
        }
      }
    } catch (error) {
      console.error('Error testing API:', error.message);
    }

    // 4. Unlock random achievements if flag is provided
    if (process.argv.includes('--unlock-random')) {
      await unlockRandomAchievements();
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function checkServerRunning() {
  try {
    // Try to make a request to the server
    execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 > /dev/null');
    return true;
  } catch (error) {
    return false;
  }
}

async function unlockRandomAchievements() {
  console.log('\nUnlocking random achievements for testing...');
  
  // Get all users
  const users = await prisma.user.findMany({
    select: { id: true }
  });
  
  if (users.length === 0) {
    console.log('⚠️ No users found in database. Create a user first.');
    return;
  }
  
  // Get all achievements
  const achievements = await prisma.achievement.findMany({
    select: { id: true }
  });
  
  // For each user, unlock a random subset of achievements
  for (const user of users) {
    // Randomly select ~30% of achievements to unlock
    const achievementsToUnlock = achievements
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.ceil(achievements.length * 0.3));
    
    console.log(`Unlocking ${achievementsToUnlock.length} achievements for user ${user.id}...`);
    
    // Create unlocked achievements
    for (const achievement of achievementsToUnlock) {
      await prisma.unlockedAchievement.upsert({
        where: {
          userId_achievementId: {
            userId: user.id,
            achievementId: achievement.id
          }
        },
        update: {
          unlockedAt: new Date()
        },
        create: {
          userId: user.id,
          achievementId: achievement.id,
          unlockedAt: new Date()
        }
      });
    }
  }
  
  console.log('✅ Random achievements unlocked successfully');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}); 