import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-auth';
import { ApiResponse } from '@/types';
import { APIError, AuthenticationError } from '@/lib/errors';

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      throw new AuthenticationError('Not authenticated');
    }

    const response: ApiResponse<typeof admin> = {
      success: true,
      data: admin
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

    console.error('Error fetching admin data:', error);
    const response: ApiResponse = {
      success: false,
      error: 'An unexpected error occurred'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 