import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export async function POST() {
  // Create response that will clear the admin auth cookie
  const response = NextResponse.json({
    success: true
  } as ApiResponse<void>);

  // Clear admin auth cookie
  response.cookies.set('admin_auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  });

  return response;
} 