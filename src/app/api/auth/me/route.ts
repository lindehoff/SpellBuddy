import { NextResponse } from 'next/server';
import { getCurrentUser, UserData } from '@/lib/auth';
import { ApiResponse } from '@/types';
import { APIError, AuthenticationError } from '@/lib/errors';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new AuthenticationError('Not authenticated');
    }

    const response: ApiResponse<UserData> = {
      success: true,
      data: user
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

    console.error('Error fetching user data:', error);
    const response: ApiResponse = {
      success: false,
      error: 'An unexpected error occurred'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 