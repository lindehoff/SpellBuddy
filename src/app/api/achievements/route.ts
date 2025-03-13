import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { achievements, userAchievements } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Get the current user (will throw if not authenticated)
    const user = await requireAuth();
    
    // Get all achievements
    const allAchievements = await db.select().from(achievements);
    
    // Get user's unlocked achievements
    const userUnlocked = await db.select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, user.id));
    
    // Create a map of unlocked achievements
    const unlockedMap = new Map();
    userUnlocked.forEach(ua => {
      unlockedMap.set(ua.achievementId, {
        unlockedAt: ua.unlockedAt,
        isNew: ua.isNew === 1,
      });
    });
    
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
    
    // Sort achievements: unlocked first, then by type and required value
    achievementsWithStatus.sort((a, b) => {
      // Unlocked achievements first
      if (a.unlockedAt && !b.unlockedAt) return -1;
      if (!a.unlockedAt && b.unlockedAt) return 1;
      
      // Then by type
      if (a.achievementType !== b.achievementType) {
        return a.achievementType.localeCompare(b.achievementType);
      }
      
      // Then by required value
      return a.requiredValue - b.requiredValue;
    });
    
    return NextResponse.json({ achievements: achievementsWithStatus });
  } catch (error: Error | unknown) {
    console.error('Error getting achievements:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to get achievements' },
      { status: 500 }
    );
  }
} 