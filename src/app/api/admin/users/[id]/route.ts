import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/db';
import { users, userPreferences, progress, achievements, userAchievements } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { ApiResponse } from '@/types';
import { APIError, ValidationError } from '@/lib/errors';

// GET /api/admin/users/:id - Get user details
export async function GET(
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
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
        experiencePoints: users.experiencePoints,
        level: users.level,
        isEnabled: sql<boolean>`CASE WHEN ${users.lastLoginAt} IS NOT NULL THEN true ELSE false END`,
      })
      .from(users)
      .where(eq(users.id, userId))
      .then(rows => rows[0] || null);

    if (!user) {
      throw new ValidationError('User not found');
    }

    const preferences = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .then(rows => rows[0] || null);

    const userProgress = await db
      .select()
      .from(progress)
      .where(eq(progress.userId, userId))
      .then(rows => rows[0] || null);

    const userAchievementsList = await db
      .select({
        id: achievements.id,
        name: achievements.name,
        description: achievements.description,
        icon: achievements.icon,
        unlockedAt: userAchievements.unlockedAt,
      })
      .from(achievements)
      .innerJoin(
        userAchievements,
        eq(achievements.id, userAchievements.achievementId)
      )
      .where(eq(userAchievements.userId, userId));

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        preferences,
        progress: userProgress,
        achievements: userAchievementsList,
      },
    });
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

// PATCH /api/admin/users/:id - Update user status (enable/disable)
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
    
    if (typeof data.enabled === 'boolean') {
      await db
        .update(users)
        .set({ 
          lastLoginAt: data.enabled ? Math.floor(Date.now() / 1000) : null 
        })
        .where(eq(users.id, userId));

      return NextResponse.json({
        success: true,
        data: { message: `User ${data.enabled ? 'enabled' : 'disabled'} successfully` }
      });
    }

    throw new ValidationError('Invalid update data');
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