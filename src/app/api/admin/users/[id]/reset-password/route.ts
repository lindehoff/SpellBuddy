import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ApiResponse } from '@/types';
import { APIError, ValidationError } from '@/lib/errors';
import bcrypt from 'bcryptjs';

// POST /api/admin/users/:id/reset-password - Reset user password
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    await requireAdmin(request);

    // Ensure params is awaited if it's a promise
    const id = params?.id;
    if (!id) {
      throw new ValidationError('User ID is required');
    }

    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new ValidationError('Invalid user ID');
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .then(rows => rows[0]);

    if (!user) {
      throw new ValidationError('User not found');
    }

    const data = await request.json();
    
    if (!data.newPassword || data.newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters long');
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(data.newPassword, 10);

    await db
      .update(users)
      .set({ 
        passwordHash
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      data: { message: 'Password reset successfully' }
    });
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 