import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Clear the authentication cookie
    clearAuthCookie();
    
    return NextResponse.json({ 
      message: 'Logout successful'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { message: error.message || 'Logout failed' },
      { status: 500 }
    );
  }
} 