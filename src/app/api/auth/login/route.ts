import { NextRequest, NextResponse } from 'next/server';
import { loginUser, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { usernameOrEmail, password } = await request.json();
    
    // Validate input
    if (!usernameOrEmail || !password) {
      return NextResponse.json(
        { message: 'Username/email and password are required' },
        { status: 400 }
      );
    }
    
    // Login the user
    const { user, token } = await loginUser(usernameOrEmail, password);
    
    // Set the authentication cookie
    setAuthCookie(token);
    
    return NextResponse.json({ 
      message: 'Login successful',
      user
    });
  } catch (error: any) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { message: error.message || 'Login failed' },
      { status: 401 }
    );
  }
} 