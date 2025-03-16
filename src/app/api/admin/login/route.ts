import { NextResponse } from 'next/server';
import { loginAdmin } from '@/lib/admin-auth';
import { ApiResponse } from '@/types';
import { APIError, ValidationError } from '@/lib/errors';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Debug log
    console.log('Admin login attempt:', {
      usernameProvided: !!username,
      passwordProvided: !!password,
      adminUsernameSet: !!process.env.ADMIN_USERNAME,
      adminPasswordSet: !!process.env.ADMIN_PASSWORD,
      adminJwtSecretSet: !!process.env.ADMIN_JWT_SECRET
    });

    if (!username || !password) {
      throw new ValidationError('Username and password are required');
    }

    const result = await loginAdmin(username, password);
    
    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      data: { admin: result.admin }
    } as ApiResponse<{ admin: typeof result.admin }>);

    // Set cookie in response
    response.cookies.set({
      name: 'admin_auth_token',
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    console.log('Login successful, token set:', {
      tokenLength: result.token.length,
      cookieSet: true
    });

    return response;
  } catch (error) {
    // Debug log
    console.error('Admin login error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    if (error instanceof APIError) {
      const response: ApiResponse = {
        success: false,
        error: error.message
      };
      return NextResponse.json(response, { status: error.status });
    }

    console.error('Admin login error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'An unexpected error occurred'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 