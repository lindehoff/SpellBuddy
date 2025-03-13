import { NextRequest, NextResponse } from 'next/server';
import { registerUser, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();
    
    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Username, email, and password are required' },
        { status: 400 }
      );
    }
    
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Register the user
    const user = await registerUser(username, email, password);
    
    // Generate JWT token (we'll implement this in the login route)
    
    return NextResponse.json({ 
      message: 'Registration successful',
      user
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { message: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
} 