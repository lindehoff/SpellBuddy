import { NextRequest, NextResponse } from 'next/server';
import * as service from '@/lib/service';
import { ApiResponse } from '@/types';

// POST /api/exercises/[id]/spoken - Submit spoken translation
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

    const { spokenText } = await request.json();
    await service.saveSpokenTranslation(exerciseId, spokenText);
    
    const response: ApiResponse<null> = {
      success: true,
      data: null
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error saving spoken translation:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to save spoken translation'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
} 