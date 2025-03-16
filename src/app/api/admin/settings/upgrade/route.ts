import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { ApiResponse } from '@/types';
import { APIError, ValidationError } from '@/lib/errors';
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

export async function POST(request: Request) {
  try {
    // Verify admin authentication
    await requireAdmin();

    const body = await request.json();
    const { version } = body;

    if (!version) {
      throw new ValidationError('Version is required');
    }

    // Upgrade to specified version
    await runContainerScript(['upgrade', '--force-version', version]);

    const response: ApiResponse<void> = {
      success: true,
      data: undefined
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

    console.error('Error upgrading version:', error);
    const response: ApiResponse = {
      success: false,
      error: 'An unexpected error occurred'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 