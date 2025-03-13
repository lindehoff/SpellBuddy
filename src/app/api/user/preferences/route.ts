import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userPreferences } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/user/preferences - Get user preferences
export async function GET(request: NextRequest) {
  try {
    // Get the current user (will throw if not authenticated)
    const user = await requireAuth();
    
    // Get user preferences
    const preferences = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, user.id)
    });
    
    if (!preferences) {
      return NextResponse.json(
        { message: 'Preferences not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(preferences);
  } catch (error: any) {
    console.error('Get preferences error:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { message: error.message || 'Failed to get preferences' },
      { status: 500 }
    );
  }
}

// PUT /api/user/preferences - Update user preferences
export async function PUT(request: NextRequest) {
  try {
    // Get the current user (will throw if not authenticated)
    const user = await requireAuth();
    
    // Get the preferences data from the request
    const data = await request.json();
    
    // Validate the data
    const validFields = [
      'age', 
      'interests', 
      'difficultyLevel', 
      'topicsOfInterest'
    ];
    
    const updateData: Record<string, any> = {};
    
    for (const field of validFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }
    
    // Add the updated timestamp
    updateData.updatedAt = Math.floor(Date.now() / 1000);
    
    // Update the preferences
    await db.update(userPreferences)
      .set(updateData)
      .where(eq(userPreferences.userId, user.id));
    
    // Get the updated preferences
    const updatedPreferences = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, user.id)
    });
    
    return NextResponse.json(updatedPreferences);
  } catch (error: any) {
    console.error('Update preferences error:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { message: error.message || 'Failed to update preferences' },
      { status: 500 }
    );
  }
} 