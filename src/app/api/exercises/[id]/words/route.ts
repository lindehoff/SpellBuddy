import { NextRequest, NextResponse } from 'next/server';
import * as service from '@/lib/service';

// POST /api/exercises/[id]/words - Mark a word as learned
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Fix: Properly handle params in an async context
    const { id } = context.params;
    const exerciseId = parseInt(id);
    
    if (isNaN(exerciseId)) {
      return NextResponse.json(
        { error: 'Invalid exercise ID' },
        { status: 400 }
      );
    }

    const { word } = await request.json();
    await service.markWordAsLearned(exerciseId, word);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking word as learned:', error);
    return NextResponse.json(
      { error: 'Failed to mark word as learned' },
      { status: 500 }
    );
  }
} 