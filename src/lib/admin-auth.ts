import { cookies } from 'next/headers';
import { AuthenticationError } from './errors';
import { signJwt, verifyJwt } from './edge-jwt';

// Get environment variables with defaults to prevent undefined
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || '';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

export interface AdminData {
  username: string;
}

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

  // Debug log for verification
  console.log('Verifying admin credentials:', {
    providedUsername: username,
    expectedUsername: ADMIN_USERNAME,
    usernameMatch: username === ADMIN_USERNAME,
    passwordMatch: password === ADMIN_PASSWORD
  });

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

  // Debug log for token
  console.log('Generated admin token:', {
    tokenLength: token.length,
    payload: { username: ADMIN_USERNAME }
  });

  return {
    admin: {
      username: ADMIN_USERNAME
    },
    token
  };
}

// Verify admin token
export async function verifyAdminToken(token: string): Promise<AdminData | null> {
  verifyAdminConfig();

  try {
    // Debug log for token verification
    console.log('Verifying admin token:', {
      tokenLength: token.length,
      jwtSecretLength: ADMIN_JWT_SECRET.length
    });

    const payload = await verifyJwt(token, ADMIN_JWT_SECRET);
    if (!payload) {
      console.log('Token verification failed');
      return null;
    }
    
    // Debug log for decoded token
    console.log('Decoded admin token:', {
      decodedUsername: payload.username,
      expectedUsername: ADMIN_USERNAME,
      usernameMatch: payload.username === ADMIN_USERNAME,
      expiresAt: new Date(payload.exp).toISOString()
    });
    
    // Verify username still matches env var
    if (payload.username !== ADMIN_USERNAME) {
      console.log('Username mismatch in token');
      return null;
    }

    return { username: ADMIN_USERNAME };
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
    console.log('No admin token found in cookies');
    return null;
  }
  
  return verifyAdminToken(token);
}

// Middleware to require admin authentication
export async function requireAdmin(): Promise<AdminData> {
  const admin = await getCurrentAdmin();
  
  if (!admin) {
    throw new AuthenticationError('Admin authentication required');
  }
  
  return admin;
} 