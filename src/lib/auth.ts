import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from './db';
import { users, userPreferences } from './db/schema';
import { eq } from 'drizzle-orm';

// JWT secret should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

export interface UserData {
  id: number;
  username: string;
  email: string;
}

// Register a new user
export async function registerUser(
  username: string,
  email: string,
  password: string
): Promise<UserData> {
  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: (users, { or }) => 
      or(
        eq(users.username, username),
        eq(users.email, email)
      )
  });

  if (existingUser) {
    throw new Error('User with this username or email already exists');
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(password, 10);

  // Insert the new user
  const [newUser] = await db.insert(users)
    .values({
      username,
      email,
      passwordHash,
      createdAt: Math.floor(Date.now() / 1000),
    })
    .returning({ id: users.id, username: users.username, email: users.email });

  // Create default user preferences
  await db.insert(userPreferences)
    .values({
      userId: newUser.id,
      difficultyLevel: 'medium',
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    });

  return newUser;
}

// Login a user
export async function loginUser(
  usernameOrEmail: string,
  password: string
): Promise<{ user: UserData; token: string }> {
  // Find the user
  const user = await db.query.users.findFirst({
    where: (users, { or }) => 
      or(
        eq(users.username, usernameOrEmail),
        eq(users.email, usernameOrEmail)
      )
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Update last login time
  await db.update(users)
    .set({ lastLoginAt: Math.floor(Date.now() / 1000) })
    .where(eq(users.id, user.id));

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    token,
  };
}

// Verify JWT token
export async function verifyToken(token: string): Promise<UserData | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    
    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId),
      columns: {
        id: true,
        username: true,
        email: true,
      },
    });

    return user || null;
  } catch (error) {
    return null;
  }
}

// Get current user from cookies
export async function getCurrentUser(): Promise<UserData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

// Set authentication cookie
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  
  // Set the cookie with HttpOnly flag
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/',
  });
}

// Clear authentication cookie
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

// Middleware to require authentication
export async function requireAuth(): Promise<UserData> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
} 