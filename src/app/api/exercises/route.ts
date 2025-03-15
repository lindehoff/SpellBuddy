import { NextRequest, NextResponse } from 'next/server';
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
export async function POST(request: NextRequest) {
  try {
    // Get the current user (will throw if not authenticated)
    const user = await requireAuth();
    
    // Create a new exercise
    const exercise = await service.createNewExercise(user.id);
    
    return NextResponse.json(exercise);
  } catch (error: any) {
    console.error('Error creating exercise:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
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
      return NextResponse.json(response, { status: error.status });
    }

    console.error('Error generating exercise:', error);
    const response: ApiResponse = {
      success: false,
      error: 'An unexpected error occurred'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 