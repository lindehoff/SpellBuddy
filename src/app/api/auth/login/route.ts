import { NextRequest, NextResponse } from 'next/server';
import { loginUser, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { usernameOrEmail, password } = await request.json() as {
      usernameOrEmail: string;
      password: string;
    };
    
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
    await setAuthCookie(token);
    
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