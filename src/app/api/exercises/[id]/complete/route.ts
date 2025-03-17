import { NextRequest, NextResponse } from 'next/server';
import * as service from '@/lib/service';
import { ApiResponse } from '@/types';

// POST /api/exercises/[id]/complete - Mark exercise as completed
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the exercise ID from the URL parameter
    const { id } = params;
    const exerciseId = parseInt(id);
    
    if (isNaN(exerciseId)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid exercise ID'
      };
      return NextResponse.json(response, { status: 400 });
    }

    await service.completeExercise(exerciseId);
    
    const response: ApiResponse<null> = {
      success: true,
      data: null
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error completing exercise:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to complete exercise'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
} 