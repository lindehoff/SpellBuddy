import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export async function GET() {
  const response: ApiResponse<{
    adminUsernameSet: boolean;
    adminPasswordSet: boolean;
    adminJwtSecretSet: boolean;
  }> = {
    success: true,
    data: {
      adminUsernameSet: !!process.env.ADMIN_USERNAME,
      adminPasswordSet: !!process.env.ADMIN_PASSWORD,
      adminJwtSecretSet: !!process.env.ADMIN_JWT_SECRET
    }
  };

  return NextResponse.json(response);
} 