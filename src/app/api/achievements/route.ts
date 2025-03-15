import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { achievements, userAchievements } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Get the current user (returns null if not authenticated)
    const user = await getCurrentUser();
    
    // Get all achievements from the database
    const allAchievements = await db.select().from(achievements);
    
    console.log(`Found ${allAchievements.length} achievements in the database`);
    
    if (allAchievements.length === 0) {
      // If no achievements found, try to seed them
      console.log('No achievements found, attempting to seed them');
      
      try {
        // Import dynamically to avoid circular dependencies
        const { seedAchievements } = await import('@/lib/db/seed/achievements');
        await seedAchievements();
        
        // Try to fetch achievements again
        const seededAchievements = await db.select().from(achievements);
        console.log(`After seeding, found ${seededAchievements.length} achievements`);
        
        if (seededAchievements.length > 0) {
          allAchievements.push(...seededAchievements);
        }
      } catch (seedError) {
        console.error('Error seeding achievements:', seedError);
      }
    }
    
    // If user is authenticated, get their unlocked achievements
    const unlockedMap = new Map<string, { unlockedAt: Date; isNew: boolean }>();
    if (user) {
      const userUnlocked = await db.select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, user.id));
      
      // Create a map of unlocked achievements
      userUnlocked.forEach(ua => {
        unlockedMap.set(String(ua.achievementId), {
          unlockedAt: ua.unlockedAt,
          isNew: ua.isNew === 1,
        });
      });
    }
    
    // Combine the data
    const achievementsWithStatus = allAchievements.map(achievement => {
      const unlocked = unlockedMap.get(achievement.id);
      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        requiredValue: achievement.requiredValue,
        achievementType: achievement.achievementType,
        unlockedAt: unlocked ? unlocked.unlockedAt : null,
        isNew: unlocked ? unlocked.isNew : false,
      };
    });
    
    // Sort achievements by type and required value
    achievementsWithStatus.sort((a, b) => {
      // First by type
      if (a.achievementType !== b.achievementType) {
        return a.achievementType.localeCompare(b.achievementType);
      }
      
      // Then by required value
      return a.requiredValue - b.requiredValue;
    });
    
    return NextResponse.json({ achievements: achievementsWithStatus });
  } catch (error: Error | unknown) {
    console.error('Error getting achievements:', error);
    
    return NextResponse.json(
      { error: 'Failed to get achievements' },
      { status: 500 }
    );
  }
} 