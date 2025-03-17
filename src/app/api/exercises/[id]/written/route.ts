import { NextRequest, NextResponse } from 'next/server';
import * as service from '@/lib/service';
import { ApiResponse } from '@/types';

// POST /api/exercises/[id]/written - Submit written translation
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

    const { writtenText } = await request.json();
    const result = await service.submitWrittenTranslation(exerciseId, writtenText);
    
    const response: ApiResponse<unknown> = {
      success: true,
      data: result
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error evaluating written translation:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to evaluate written translation'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
} 