import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ApiResponse } from '@/types';
import { APIError, ValidationError } from '@/lib/errors';

// PATCH /api/admin/users/:id/experience - Update user experience and level
export async function PATCH(
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
    
    if (typeof data.experiencePoints !== 'number' || typeof data.level !== 'number') {
      throw new ValidationError('Experience points and level are required');
    }

    await db
      .update(users)
      .set({ 
        experiencePoints: data.experiencePoints,
        level: data.level
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      data: { message: 'User experience updated successfully' }
    });
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    console.error('Error updating user experience:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 