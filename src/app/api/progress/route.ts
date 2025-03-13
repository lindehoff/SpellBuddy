import { NextResponse } from 'next/server';
import * as service from '@/lib/service';

// GET /api/progress - Get progress report
export async function GET() {
  try {
    const progress = await service.getProgressReport();
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error getting progress report:', error);
    return NextResponse.json(
      { error: 'Failed to get progress report' },
      { status: 500 }
    );
  }
} 