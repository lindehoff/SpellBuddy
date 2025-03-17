import { NextResponse } from 'next/server';
import * as service from '@/lib/service';
import { requireAuth } from '@/lib/auth';
import { generateExercise } from '@/lib/openai';
import { getCurrentUser } from '@/lib/auth';
import { ApiResponse } from '@/types';
import { APIError, AuthenticationError } from '@/lib/errors';

interface Exercise {
  original: string;
  translation: string;
  difficulty: number;
}

// POST /api/exercises - Create a new exercise
export async function POST() {
  try {
    // Get the current user (will throw if not authenticated)
    const user = await requireAuth();
    
    console.log(`Creating exercise for user ${user.id}`);
    
    // Create a new exercise
    const exercise = await service.createNewExercise(user.id);
    
    console.log(`Exercise created successfully with ID: ${exercise.id}`);
    
    const response: ApiResponse<unknown> = {
      success: true,
      data: exercise
    };
    
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof APIError) {
      const response: ApiResponse = {
        success: false,
        error: error.message
      };
      return NextResponse.json(response, { status: error instanceof AuthenticationError ? 401 : 500 });
    }
    
    console.error('Error creating exercise:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to create exercise'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new AuthenticationError('Not authenticated');
    }

    const exercise = await generateExercise();

    const response: ApiResponse<Exercise> = {
      success: true,
      data: exercise
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof APIError) {
      const response: ApiResponse = {
        success: false,
        error: error.message
      };
      return NextResponse.json(response, { status: error instanceof AuthenticationError ? 401 : 500 });
    }

    console.error('Error generating exercise:', error);
    const response: ApiResponse = {
      success: false,
      error: 'An unexpected error occurred'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 