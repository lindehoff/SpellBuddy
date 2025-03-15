import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getProgressReport } from '@/lib/openai';
import { ApiResponse } from '@/types';
import { APIError, AuthenticationError } from '@/lib/errors';

interface ProgressReport {
  summary: string;
  strengths: string;
  challenges: string;
  tips: string[];
  encouragement: string;
}

// GET /api/progress - Get progress report
export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new AuthenticationError('Not authenticated');
    }

    // For now, using mock data - in production, fetch real stats from database
    const report = await getProgressReport(
      10, // exerciseCount
      80, // correctWordCount
      20, // incorrectWordCount
      ['difficult', 'words', 'here'] // difficultWords
    );

    const response: ApiResponse<ProgressReport> = {
      success: true,
      data: report
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof APIError) {
      const response: ApiResponse = {
        success: false,
        error: error.message
      };
      return NextResponse.json(response, { status: error.status });
    }

    console.error('Error fetching progress:', error);
    const response: ApiResponse = {
      success: false,
      error: 'An unexpected error occurred'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 