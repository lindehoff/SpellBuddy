import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin } from '@/lib/admin-auth';
import { ApiResponse } from '@/types';
import { APIError, ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      throw new ValidationError('Username and password are required');
    }

    const result = await loginAdmin(username, password);
    
    const response = NextResponse.json({ 
      success: true, 
      data: { message: 'Login successful' } 
    });
    
    response.cookies.set('admin_auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
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