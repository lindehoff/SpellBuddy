import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-auth';
import { ApiResponse } from '@/types';
import { APIError, AuthenticationError } from '@/lib/errors';

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      throw new AuthenticationError('Not authenticated');
    }
    
    return NextResponse.json({
      success: true,
      data: admin
    });
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 