import { NextResponse } from 'next/server';
import * as service from '@/lib/service';

// POST /api/exercises - Create a new exercise
export async function POST() {
  try {
    const exercise = await service.createNewExercise();
    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
} 