import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { ApiResponse } from '@/types';
import { APIError } from '@/lib/errors';
import { db } from '@/lib/db';
import { appSettings } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Helper function to run container management script
async function runContainerScript(args: string[]): Promise<string> {
  try {
    const { stdout } = await execAsync(`./manage-container.sh ${args.join(' ')}`);
    return stdout;
  } catch (error) {
    console.error('Container script error:', error);
    throw new Error('Failed to execute container management script');
  }
}

// Helper function to get current settings
async function getCurrentSettings() {
  // Get current version and available versions
  const versionOutput = await runContainerScript(['version']);
  const currentVersion = versionOutput.match(/Current version: (.+)/)?.[1] || 'unknown';
  const availableVersions = versionOutput
    .split('\n')
    .filter(line => line.startsWith('lindehoff/spellbuddy:'))
    .map(line => line.split(':')[1].trim());

  // Get settings from database
  const settings = await db.query.appSettings.findMany();
  const settingsMap = new Map(settings.map(s => [s.key, s.value]));

  return {
    currentVersion,
    availableVersions,
    openaiModel: settingsMap.get('openai_model') || process.env.OPENAI_MODEL || 'gpt-4o-mini',
    jwtSecret: '********', // Don't expose actual secret
    adminUsername: process.env.ADMIN_USERNAME || 'admin',
    debugMode: settingsMap.get('debug_mode') === 'true'
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await requireAdmin(request);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Settings management is coming soon'
      }
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

export async function PUT(request: Request) {
  try {
    // Verify admin authentication
    const admin = await requireAdmin();

    const body = await request.json();
    const { openaiModel, debugMode } = body;

    // Update settings in database
    await db.insert(appSettings)
      .values([
        {
          key: 'openai_model',
          value: openaiModel,
          updatedAt: Math.floor(Date.now() / 1000),
          updatedBy: admin.id
        },
        {
          key: 'debug_mode',
          value: String(debugMode),
          updatedAt: Math.floor(Date.now() / 1000),
          updatedBy: admin.id
        }
      ])
      .onConflictDoUpdate({
        target: appSettings.key,
        set: {
          value: sql`excluded.value`,
          updatedAt: sql`excluded.updated_at`,
          updatedBy: sql`excluded.updated_by`
        }
      });

    // Restart container with new settings
    await runContainerScript(['restart']);

    const settings = await getCurrentSettings();

    const response: ApiResponse<typeof settings> = {
      success: true,
      data: settings
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof APIError) {
      const response: ApiResponse = {
        success: false,
        error: error.message
      };
      return NextResponse.json(response, { status: error.status });
    }

    console.error('Error updating settings:', error);
    const response: ApiResponse = {
      success: false,
      error: 'An unexpected error occurred'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 