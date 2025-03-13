import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get the current user from the cookie
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Get current user error:', error);
    
    return NextResponse.json(
      { message: error.message || 'Failed to get current user' },
      { status: 500 }
    );
  }
} 