import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { APIError, AuthenticationError } from '@/lib/errors';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new AuthenticationError('Not authenticated');
    }

    return NextResponse.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 