import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';
import { APIError, ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usernameOrEmail, password } = body;

    if (!usernameOrEmail || !password) {
      throw new ValidationError('Username/email and password are required');
    }

    const result = await loginUser(usernameOrEmail, password);
    
    // Create response with user data
    const response = NextResponse.json({
      success: true,
      data: { 
        user: result.user,
        token: result.token 
      }
    });

    // Set auth cookie
    response.cookies.set('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 