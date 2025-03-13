import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import * as gamification from '@/lib/gamification';

export async function POST(request: NextRequest) {
  try {
    // Get the current user (will throw if not authenticated)
    const user = await requireAuth();
    
    // Get achievement IDs from request body
    const { achievementIds } = await request.json();
    
    if (!Array.isArray(achievementIds) || achievementIds.length === 0) {
      return NextResponse.json(
        { error: 'Achievement IDs are required' },
        { status: 400 }
      );
    }
    
    // Mark achievements as seen
    await gamification.markAchievementsSeen(user.id, achievementIds);
    
    return NextResponse.json({ success: true });
  } catch (error: Error | unknown) {
    console.error('Error marking achievements as seen:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to mark achievements as seen' },
      { status: 500 }
    );
  }
} 