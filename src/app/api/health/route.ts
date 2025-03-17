import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function GET() {
  try {
    // Check if the user is authenticated
    const user = await getCurrentUser();
    
    // Get basic system info
    const systemInfo = {
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV || 'development',
      authenticated: !!user,
      userId: user?.id || null,
    };
    
    const response: ApiResponse<typeof systemInfo> = {
      success: true,
      data: systemInfo
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Health check error:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'API health check failed'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
} 