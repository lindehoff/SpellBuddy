import { NextRequest, NextResponse } from 'next/server';
import * as service from '@/lib/service';
import { requireAuth } from '@/lib/auth';

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