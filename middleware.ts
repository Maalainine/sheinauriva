import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// List of public paths that don't require authentication
const publicPaths = [
  '/',
  '/products',
  '/products/**',
  '/categories',
  '/categories/**',
  '/brands',
  '/brands/**',
  '/contact',
  '/wishlist',
  '/cart',
  '/checkout',
  '/search',
  '/admin/login',
  '/api/auth/**',
  '/api/public/**',
  '/_next/**',
  '/favicon.ico',
  '/images/**',
];

// Check if the current path is public
const isPublicPath = (path: string) => {
  return publicPaths.some(publicPath => {
    // Handle wildcard paths
    if (publicPath.endsWith('**')) {
      const basePath = publicPath.replace(/\*\*$/, '');
      return path.startsWith(basePath);
    }
    return path === publicPath;
  });
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check if the path is an admin route
  const isAdminRoute = pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    // Get the token from the request
    const token = await getToken({ req: request });
    
    // If no token and trying to access admin route, redirect to login
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // If user is not an admin, redirect to home
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  // Add headers for the request
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', request.url);
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    // Exclude all API routes, especially /api/auth/*
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
