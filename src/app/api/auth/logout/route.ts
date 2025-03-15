import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import { ApiResponse } from '@/types';
import { APIError } from '@/lib/errors';

export async function POST(_request: NextRequest) {
  try {
    await clearAuthCookie();
    
    const response: ApiResponse = {
      success: true,
      data: { message: 'Logged out successfully' }
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

    console.error('Logout error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'An unexpected error occurred'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 