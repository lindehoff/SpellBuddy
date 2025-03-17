import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import * as gamification from '@/lib/gamification';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Get the current user (will throw if not authenticated)
    const user = await requireAuth();
    
    // Get achievement IDs from request body
    const { achievementIds } = await request.json();
    
    if (!Array.isArray(achievementIds) || achievementIds.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: 'Achievement IDs are required'
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    // Mark achievements as seen
    await gamification.markAchievementsSeen(user.id, achievementIds);
    
    const response: ApiResponse<null> = {
      success: true,
      data: null
    };
    
    return NextResponse.json(response);
  } catch (error: Error | unknown) {
    console.error('Error marking achievements as seen:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required'
      };
      return NextResponse.json(response, { status: 401 });
    }
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to mark achievements as seen'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
} 