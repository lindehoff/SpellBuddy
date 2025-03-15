import { db } from './db';
import { users, achievements, userAchievements, progress, userChallenges } from './db/schema';
import { eq, and, gt, count } from 'drizzle-orm';

// Experience points required for each level (exponential growth)
const LEVEL_EXPERIENCE = [
  0,      // Level 0 (not used)
  100,    // Level 1
  250,    // Level 2
  500,    // Level 3
  1000,   // Level 4
  1750,   // Level 5
  2750,   // Level 6
  4000,   // Level 7
  5500,   // Level 8
  7250,   // Level 9
  9250,   // Level 10
];

// Generate experience requirements for higher levels
for (let i = 11; i <= 100; i++) {
  // Exponential growth formula
  LEVEL_EXPERIENCE[i] = Math.round(LEVEL_EXPERIENCE[i-1] * 1.15);
}

/**
 * Add experience points to a user and check for level up
 * @param userId User ID
 * @param points Experience points to add
 * @returns Object with level up information
 */
export async function addExperiencePoints(userId: number, points: number): Promise<{
  leveledUp: boolean;
  newLevel?: number;
  oldLevel?: number;
}> {
  // Get current user data
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      experiencePoints: true,
      level: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Calculate new experience points
  const oldXP = user.experiencePoints || 0;
  const newXP = oldXP + points;
  const oldLevel = user.level || 1;
  
  // Check if user leveled up
  let newLevel = oldLevel;
  let leveledUp = false;
  
  // Find the highest level the user qualifies for
  while (newLevel < LEVEL_EXPERIENCE.length - 1 && newXP >= LEVEL_EXPERIENCE[newLevel + 1]) {
    newLevel++;
    leveledUp = true;
  }
  
  // Update user data
  await db.update(users)
    .set({ 
      experiencePoints: newXP,
      level: newLevel,
    })
    .where(eq(users.id, userId));
  
  return {
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
    oldLevel: leveledUp ? oldLevel : undefined,
  };
}

/**
 * Get experience points required for the next level
 * @param currentLevel Current user level
 * @returns Experience points required for the next level
 */
export function getExperienceForNextLevel(currentLevel: number): number {
  const nextLevel = Math.min(currentLevel + 1, LEVEL_EXPERIENCE.length - 1);
  return LEVEL_EXPERIENCE[nextLevel];
}

/**
 * Check for new achievements and unlock them if conditions are met
 * @param userId User ID
 * @returns Array of newly unlocked achievements
 */
export async function checkAchievements(userId: number): Promise<any[]> {
  // Get user progress data
  const userProgress = await db.query.progress.findFirst({
    where: eq(progress.userId, userId),
  });
  
  if (!userProgress) {
    return [];
  }
  
  // Get user data
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      level: true,
    },
  });
  
  if (!user) {
    return [];
  }
  
  // Get all achievements that the user hasn't unlocked yet
  const unlockedAchievementIds = await db.select({ id: userAchievements.achievementId })
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));
  
  const unlockedIds = unlockedAchievementIds.map(a => a.id);
  
  // Get all available achievements
  const allAchievements = await db.select()
    .from(achievements);
    
  // Filter out already unlocked achievements
  const filteredAchievements = unlockedIds.length > 0
    ? allAchievements.filter(achievement => !unlockedIds.includes(achievement.id))
    : allAchievements;
  
  // Check each achievement to see if it should be unlocked
  const newlyUnlocked = [];
  
  for (const achievement of filteredAchievements) {
    let shouldUnlock = false;
    
    switch (achievement.achievementType) {
      case 'streak':
        shouldUnlock = userProgress.streakDays >= achievement.requiredValue;
        break;
      case 'exercises':
        shouldUnlock = userProgress.totalExercises >= achievement.requiredValue;
        break;
      case 'perfect_exercises':
        shouldUnlock = userProgress.perfectExercises >= achievement.requiredValue;
        break;
      case 'correct_words':
        shouldUnlock = userProgress.correctWords >= achievement.requiredValue;
        break;
      case 'level':
        shouldUnlock = (user.level || 1) >= achievement.requiredValue;
        break;
      case 'challenges':
        // Count completed challenges for the user
        const completedChallenges = await db.select({ count: count() })
          .from(userChallenges)
          .where(
            and(
              eq(userChallenges.userId, userId),
              eq(userChallenges.isCompleted, 1)
            )
          );
        
        shouldUnlock = completedChallenges[0]?.count >= achievement.requiredValue;
        break;
      case 'accuracy':
        // This would be checked when an exercise is completed
        // For now, we'll skip this check
        shouldUnlock = false;
        break;
      case 'time':
        // This would be checked when an exercise is completed
        // For now, we'll skip this check
        shouldUnlock = false;
        break;
      case 'difficulty_beginner':
      case 'difficulty_intermediate':
      case 'difficulty_advanced':
      case 'difficulty_expert':
        // Count exercises completed at the specified difficulty level
        // For now, we'll skip this check
        shouldUnlock = false;
        break;
    }
    
    if (shouldUnlock) {
      // Unlock the achievement
      const now = Math.floor(Date.now() / 1000);
      
      await db.insert(userAchievements)
        .values({
          userId,
          achievementId: achievement.id,
          unlockedAt: now,
          isNew: 1,
        });
      
      newlyUnlocked.push({
        ...achievement,
        unlockedAt: now,
        isNew: true,
      });
    }
  }
  
  return newlyUnlocked;
}

/**
 * Mark achievements as seen (not new)
 * @param userId User ID
 * @param achievementIds Achievement IDs to mark as seen
 */
export async function markAchievementsSeen(userId: number, achievementIds: number[]): Promise<void> {
  if (achievementIds.length === 0) {
    return;
  }
  
  await db.update(userAchievements)
    .set({ isNew: 0 })
    .where(
      and(
        eq(userAchievements.userId, userId),
        // Only update the specified achievements
        ...achievementIds.map(id => eq(userAchievements.achievementId, id))
      )
    );
} 