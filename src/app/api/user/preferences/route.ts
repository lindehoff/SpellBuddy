import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { userPreferences } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ApiResponse } from '@/types';
import { APIError, AuthenticationError, ValidationError } from '@/lib/errors';

interface UserPreferencesResponse {
  age: number | null;
  interests: string | null;
  difficultyLevel: string;
  topicsOfInterest: string | null;
  adaptiveDifficulty: number;
  currentDifficultyScore: number;
}

// GET /api/user/preferences - Get user preferences
export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new AuthenticationError('Not authenticated');
    }

    const preferences = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, user.id)
    });

    if (!preferences) {
      throw new ValidationError('User preferences not found');
    }

    const response: ApiResponse<UserPreferencesResponse> = {
      success: true,
      data: {
        age: preferences.age,
        interests: preferences.interests,
        difficultyLevel: preferences.difficultyLevel ?? 'beginner',
        topicsOfInterest: preferences.topicsOfInterest,
        adaptiveDifficulty: preferences.adaptiveDifficulty,
        currentDifficultyScore: preferences.currentDifficultyScore
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof APIError) {
      const response: ApiResponse = {
        success: false,
        error: error.message
      };
      return NextResponse.json(response, { status: error.status });
    }

    console.error('Error fetching user preferences:', error);
    const response: ApiResponse = {
      success: false,
      error: 'An unexpected error occurred'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/user/preferences - Update user preferences
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new AuthenticationError('Not authenticated');
    }

    const body = await request.json();
    const { age, interests, difficultyLevel, topicsOfInterest, adaptiveDifficulty, currentDifficultyScore } = body;

    // Validate input
    if (age !== undefined && (typeof age !== 'number' || age < 0)) {
      throw new ValidationError('Age must be a positive number');
    }

    if (interests !== undefined && typeof interests !== 'string') {
      throw new ValidationError('Interests must be a string');
    }

    if (difficultyLevel && !['beginner', 'intermediate', 'advanced', 'expert'].includes(difficultyLevel)) {
      throw new ValidationError('Invalid difficulty level');
    }

    if (topicsOfInterest !== undefined && typeof topicsOfInterest !== 'string') {
      throw new ValidationError('Topics of interest must be a string');
    }

    if (adaptiveDifficulty !== undefined && ![0, 1].includes(adaptiveDifficulty)) {
      throw new ValidationError('Adaptive difficulty must be 0 or 1');
    }

    if (currentDifficultyScore !== undefined && (typeof currentDifficultyScore !== 'number' || currentDifficultyScore < 1 || currentDifficultyScore > 100)) {
      throw new ValidationError('Current difficulty score must be between 1 and 100');
    }

    // Update only provided fields
    const updateData: Partial<UserPreferencesResponse> & { updatedAt?: number } = {};
    if (age !== undefined) updateData.age = age;
    if (interests !== undefined) updateData.interests = interests;
    if (difficultyLevel !== undefined) updateData.difficultyLevel = difficultyLevel;
    if (topicsOfInterest !== undefined) updateData.topicsOfInterest = topicsOfInterest;
    if (adaptiveDifficulty !== undefined) updateData.adaptiveDifficulty = adaptiveDifficulty;
    if (currentDifficultyScore !== undefined) updateData.currentDifficultyScore = currentDifficultyScore;
    updateData.updatedAt = Math.floor(Date.now() / 1000);

    await db.update(userPreferences)
      .set(updateData)
      .where(eq(userPreferences.userId, user.id));

    const response: ApiResponse<UserPreferencesResponse> = {
      success: true,
      data: {
        age: updateData.age ?? null,
        interests: updateData.interests ?? null,
        difficultyLevel: updateData.difficultyLevel ?? 'beginner',
        topicsOfInterest: updateData.topicsOfInterest ?? null,
        adaptiveDifficulty: updateData.adaptiveDifficulty ?? 1,
        currentDifficultyScore: updateData.currentDifficultyScore ?? 1
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof APIError) {
      const response: ApiResponse = {
        success: false,
        error: error.message
      };
      return NextResponse.json(response, { status: error.status });
    }

    console.error('Error updating user preferences:', error);
    const response: ApiResponse = {
      success: false,
      error: 'An unexpected error occurred'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 