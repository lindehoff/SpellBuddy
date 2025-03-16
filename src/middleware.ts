import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check if this is an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('Admin route accessed:', {
      path: request.nextUrl.pathname,
      hasAuthCookie: !!request.cookies.get('admin_auth_token')
    });

    // Allow access to login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check for admin auth token
    const token = request.cookies.get('admin_auth_token')?.value;
    if (!token) {
      console.log('No admin auth token found, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// Configure the middleware to run only on admin routes
export const config = {
  matcher: ['/admin/:path*']
}; 