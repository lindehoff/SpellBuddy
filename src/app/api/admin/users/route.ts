import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { desc, like, or, eq } from 'drizzle-orm';
import { ApiResponse } from '@/types';
import { APIError } from '@/lib/errors';
import { sql } from 'drizzle-orm';

const USERS_PER_PAGE = 10;

// GET /api/admin/users - Get paginated list of users with search
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await requireAdmin(request);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * USERS_PER_PAGE;

    // Build search condition
    const searchCondition = search
      ? or(
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      : undefined;

    // Get users with pagination
    const usersList = await db
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
      .where(searchCondition)
      .limit(USERS_PER_PAGE)
      .offset(offset)
      .orderBy(desc(users.createdAt));

    // Get total count for pagination
    const totalUsers = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(searchCondition)
      .then(rows => Number(rows[0].count));

    const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

    return NextResponse.json({
      success: true,
      data: {
        users: usersList,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
        },
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

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      throw new Error('Invalid user ID');
    }
    
    const { enabled } = await request.json();

    // Update user's lastLoginAt to enable/disable
    await db
      .update(users)
      .set({
        lastLoginAt: enabled ? sql`CURRENT_TIMESTAMP` : null
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      data: { message: `User ${enabled ? 'enabled' : 'disabled'} successfully` }
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