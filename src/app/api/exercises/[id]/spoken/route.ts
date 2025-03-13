import { NextRequest, NextResponse } from 'next/server';
import * as service from '@/lib/service';

// POST /api/exercises/[id]/spoken - Save spoken translation
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Get the exercise ID from the URL parameter
    const exerciseId = parseInt(context.params.id);
    
    if (isNaN(exerciseId)) {
      return NextResponse.json(
        { error: 'Invalid exercise ID' },
        { status: 400 }
      );
    }

    const { spokenText } = await request.json();
    await service.saveSpokenTranslation(exerciseId, spokenText);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving spoken translation:', error);
    return NextResponse.json(
      { error: 'Failed to save spoken translation' },
      { status: 500 }
    );
  }
} 