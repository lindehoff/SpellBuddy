import { NextRequest, NextResponse } from 'next/server';
import * as service from '@/lib/service';
import { requireAuth } from '@/lib/auth';

// GET /api/progress - Get progress report
export async function GET(request: NextRequest) {
  try {
    // Get the current user (will throw if not authenticated)
    const user = await requireAuth();
    
    // Get progress report
    const report = await service.getProgressReport(user.id);
    
    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Error getting progress report:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to get progress report' },
      { status: 500 }
    );
  }
} 