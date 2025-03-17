import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, progress } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { checkAchievements } from '@/lib/gamification';

export async function GET() {
  try {
    // Get the authenticated user
    const user = await requireAuth();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the user from the database with streak information
    const userData = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: {
        id: true,
        currentStreak: true,
        longestStreak: true,
        lastActivityDate: true,
      },
    });
    
    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if the streak needs to be updated
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActivity = userData.lastActivityDate ? new Date(userData.lastActivityDate * 1000) : null;
    
    if (lastActivity) {
      lastActivity.setHours(0, 0, 0, 0);
      
      // Calculate the difference in days
      const diffTime = Math.abs(today.getTime() - lastActivity.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If the last activity was more than 1 day ago, reset the streak
      if (diffDays > 1) {
        await db.update(users)
          .set({
            currentStreak: 1, // Reset to 1 for today's activity
            lastActivityDate: Math.floor(Date.now() / 1000),
          })
          .where(eq(users.id, user.id));
        
        // Also update the streak in the progress table
        await updateProgressStreak(user.id, 1, userData.longestStreak || 0);
        
        // Check for achievements
        const newAchievements = await checkAchievements(user.id);
        
        return NextResponse.json({
          success: true,
          data: {
            currentStreak: 1,
            longestStreak: userData.longestStreak,
            newAchievements: newAchievements.length > 0 ? newAchievements : undefined,
          },
        });
      }
      
      // If the last activity was today, return the current streak
      if (diffDays === 0) {
        return NextResponse.json({
          success: true,
          data: {
            currentStreak: userData.currentStreak,
            longestStreak: userData.longestStreak,
          },
        });
      }
      
      // If the last activity was yesterday, increment the streak
      if (diffDays === 1) {
        const newStreak = (userData.currentStreak || 0) + 1;
        const newLongestStreak = Math.max(newStreak, userData.longestStreak || 0);
        
        await db.update(users)
          .set({
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            lastActivityDate: Math.floor(Date.now() / 1000),
          })
          .where(eq(users.id, user.id));
        
        // Also update the streak in the progress table
        await updateProgressStreak(user.id, newStreak, newLongestStreak);
        
        // Check for achievements
        const newAchievements = await checkAchievements(user.id);
        
        return NextResponse.json({
          success: true,
          data: {
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            newAchievements: newAchievements.length > 0 ? newAchievements : undefined,
          },
        });
      }
    } else {
      // First activity, set streak to 1
      await db.update(users)
        .set({
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: Math.floor(Date.now() / 1000),
        })
        .where(eq(users.id, user.id));
      
      // Also update the streak in the progress table
      await updateProgressStreak(user.id, 1, 1);
      
      // Check for achievements
      const newAchievements = await checkAchievements(user.id);
      
      return NextResponse.json({
        success: true,
        data: {
          currentStreak: 1,
          longestStreak: 1,
          newAchievements: newAchievements.length > 0 ? newAchievements : undefined,
        },
      });
    }
    
    // Default response
    return NextResponse.json({
      success: true,
      data: {
        currentStreak: userData.currentStreak || 0,
        longestStreak: userData.longestStreak || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching streak:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch streak data' },
      { status: 500 }
    );
  }
}

// Helper function to update the streak in the progress table
async function updateProgressStreak(userId: number, currentStreak: number, longestStreak: number) {
  try {
    // Check if progress record exists
    const progressRecord = await db.query.progress.findFirst({
      where: eq(progress.userId, userId),
    });
    
    if (progressRecord) {
      // Update existing record
      await db.update(progress)
        .set({
          streakDays: currentStreak,
          longestStreak: longestStreak,
          lastExerciseDate: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000),
        })
        .where(eq(progress.userId, userId));
    } else {
      // Create new progress record
      await db.insert(progress)
        .values({
          userId: userId,
          streakDays: currentStreak,
          longestStreak: longestStreak,
          lastExerciseDate: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000),
        });
    }
  } catch (error) {
    console.error('Error updating progress streak:', error);
  }
} 