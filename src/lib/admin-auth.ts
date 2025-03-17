import { cookies } from 'next/headers';
import { AuthenticationError } from './errors';
import { signJwt, verifyJwt } from './edge-jwt';
import { NextRequest } from 'next/server';
import { APIError } from './errors';
import { AdminData } from '@/types';

// Get environment variables with defaults to prevent undefined
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || '';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

// Verify admin credentials exist
export function verifyAdminConfig() {
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_JWT_SECRET) {
    throw new Error('Admin credentials not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_JWT_SECRET environment variables.');
  }
}

// Login admin user
export async function loginAdmin(
  username: string,
  password: string
): Promise<{ admin: AdminData; token: string }> {
  verifyAdminConfig();

  // Check username
  if (username !== ADMIN_USERNAME) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Check password (direct comparison since we're using env var)
  if (password !== ADMIN_PASSWORD) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Generate token
  const token = await signJwt(
    { username: ADMIN_USERNAME },
    ADMIN_JWT_SECRET
  );

  return {
    admin: {
      id: 1,
      username: ADMIN_USERNAME
    },
    token
  };
}

// Verify admin token
export async function verifyAdminToken(token: string): Promise<AdminData | null> {
  verifyAdminConfig();

  try {
    const payload = await verifyJwt(token, ADMIN_JWT_SECRET);
    if (!payload) {
      return null;
    }
    
    // Verify username still matches env var
    if (payload.username !== ADMIN_USERNAME) {
      return null;
    }

    return { 
      id: 1,
      username: ADMIN_USERNAME 
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Get current admin from cookies
export async function getCurrentAdmin(): Promise<AdminData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_auth_token')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyAdminToken(token);
}

// Middleware to require admin authentication
export async function requireAdmin(request: NextRequest): Promise<AdminData> {
  const token = request.cookies.get('admin_auth_token')?.value;
  
  if (!token) {
    throw new APIError('Unauthorized', 401);
  }

  const admin = await verifyAdminToken(token);
  if (!admin) {
    throw new APIError('Unauthorized', 401);
  }

  return admin;
} 