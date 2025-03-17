import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getProgressReport } from '@/lib/openai';
import { ApiResponse } from '@/types';
import { APIError } from '@/lib/errors';
import { db } from '@/lib/db';
import { progress, users, userAchievements, achievements } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getExperienceForNextLevel } from '@/lib/gamification';

// Simple in-memory cache to prevent duplicate OpenAI calls
const progressCache = new Map<number, {
  data: ProgressReport;
  timestamp: number;
}>();

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

interface ProgressReport {
  summary: string;
  strengths: string;
  challenges: string;
  tips: string[];
  encouragement: string;
  level?: number;
  experiencePoints?: number;
  nextLevelPoints?: number;
  achievements?: Achievement[];
  streak?: number;
}

// Update type definitions to match actual data structure
interface UserProgress {
  id: number;
  userId: number;
  level: number;
  experience: number;
  currentStreak?: number;
  longestStreak?: number;
  totalExercises: number;
  correctWords: number;
  incorrectWords: number;
  streakDays: number;
  lastExerciseDate: number | null;
  perfectExercises: number;
  totalExperiencePoints: number;
  updatedAt: number;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  type: string;
  isNew: boolean;
  unlockedAt: number;
}

// GET /api/progress - Get progress report
export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    
    if (!user) {
      throw new APIError('Not authenticated', 401);
    }

    // Get user data from database
    const userData = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: {
        id: true,
        level: true,
        experiencePoints: true,
        currentStreak: true,
        longestStreak: true,
      },
    });

    if (!userData) {
      throw new APIError('User not found', 404);
    }

    // Get user progress data
    const userProgressData = await db.query.progress.findFirst({
      where: eq(progress.userId, user.id),
    });

    // Handle case where userProgress might be undefined
    const userProgress: UserProgress = userProgressData || {
      id: 0,
      userId: user.id,
      level: 1,
      experience: 0,
      totalExercises: 0,
      correctWords: 0,
      incorrectWords: 0,
      streakDays: 0,
      lastExerciseDate: null,
      perfectExercises: 0,
      totalExperiencePoints: 0,
      updatedAt: Date.now(),
    };

    // Get user achievements
    const userAchievementsData = await db.select({
      achievement: achievements,
      isNew: userAchievements.isNew,
      unlockedAt: userAchievements.unlockedAt,
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, user.id));

    // Format achievements for the response
    const formattedAchievements: Achievement[] = userAchievementsData.map(item => ({
      id: item.achievement.id,
      name: item.achievement.name,
      description: item.achievement.description,
      icon: item.achievement.icon,
      type: item.achievement.achievementType,
      isNew: item.isNew === 1,
      unlockedAt: item.unlockedAt,
    }));

    // Calculate next level experience points
    const nextLevelPoints = getExperienceForNextLevel(userData.level || 1);

    // Check cache for existing progress report
    const cacheKey = user.id;
    const cachedData = progressCache.get(cacheKey);
    const now = Date.now();
    
    let aiReport;
    
    if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRATION) {
      // Use cached data if it exists and hasn't expired
      console.log('Using cached progress report');
      aiReport = cachedData.data;
    } else {
      // Only call OpenAI if we have progress data and need a personalized report
      aiReport = {
        summary: "Start practicing to see your progress!",
        strengths: "You're taking the first step by using SpellBuddy.",
        challenges: "Regular practice will help you improve your spelling skills.",
        tips: ["Practice a little each day", "Focus on words you find difficult"],
        encouragement: "Let's get started on your spelling journey!"
      };

      if (userProgress && 
          (userProgress.totalExercises > 0 || 
           userProgress.correctWords > 0 || 
           userProgress.incorrectWords > 0)) {
        // We have actual progress data, get a personalized report
        aiReport = await getProgressReport(
          userProgress.totalExercises,
          userProgress.correctWords,
          userProgress.incorrectWords,
          [] // We could fetch difficult words here if needed
        );
        
        // Cache the result
        progressCache.set(cacheKey, {
          data: aiReport,
          timestamp: now
        });
      }
    }

    // Combine all data for the response
    const enhancedReport: ProgressReport = {
      ...aiReport,
      level: userData.level || 1,
      experiencePoints: userData.experiencePoints || 0,
      nextLevelPoints,
      achievements: formattedAchievements,
      streak: userData.currentStreak || 0,
      // Ensure tips is always an array
      tips: Array.isArray(aiReport.tips) ? aiReport.tips : []
    };

    const response: ApiResponse<ProgressReport> = {
      success: true,
      data: enhancedReport
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof APIError) {
      const response: ApiResponse = {
        success: false,
        error: error.message
      };
      return NextResponse.json(response, { status: error.statusCode });
    }

    console.error('Error fetching progress:', error);
    const response: ApiResponse = {
      success: false,
      error: 'An unexpected error occurred'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 