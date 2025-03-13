import { NextRequest, NextResponse } from 'next/server';
import * as service from '@/lib/service';

// POST /api/exercises/[id]/written - Submit written translation
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params is properly accessed in an async context
    const { id } = params;
    const exerciseId = parseInt(id);
    
    if (isNaN(exerciseId)) {
      return NextResponse.json(
        { error: 'Invalid exercise ID' },
        { status: 400 }
      );
    }

    const { writtenText } = await request.json();
    const result = await service.submitWrittenTranslation(exerciseId, writtenText);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error evaluating written translation:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate written translation' },
      { status: 500 }
    );
  }
} 