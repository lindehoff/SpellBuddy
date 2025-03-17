import { NextRequest, NextResponse } from 'next/server';
import * as service from '@/lib/service';
import { ApiResponse } from '@/types';

// POST /api/exercises/[id]/words - Mark a word as learned
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the exercise ID from the URL parameter
    const exerciseId = parseInt(params.id);
    
    if (isNaN(exerciseId)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid exercise ID'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { word } = await request.json();
    await service.markWordAsLearned(exerciseId, word);
    
    const response: ApiResponse<null> = {
      success: true,
      data: null
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error marking word as learned:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to mark word as learned'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
} 