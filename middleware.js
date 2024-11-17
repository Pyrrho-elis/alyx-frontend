import { NextResponse } from 'next/server'
import { createClient } from './app/utils/supabase/middleware'

// Public routes that anyone can access
const PUBLIC_ROUTES = [
  '/',
  '/learn-more',
  '/waitlist',
]

// API routes that are needed for public functionality
const PUBLIC_API_ROUTES = [
  '/api/get-early-access',
]

// Static assets and system routes
const SYSTEM_ROUTES = [
  '/_next',
  '/fonts',
  '/images',
  '/favicon.ico',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml'
]

export async function middleware(req) {
  // Check if it's a system route (always allow)
  if (SYSTEM_ROUTES.some(route => req.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if it's a public route (allow without auth)
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    req.nextUrl.pathname === route || req.nextUrl.pathname === `${route}/`
  );

  const isPublicApiRoute = PUBLIC_API_ROUTES.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // For all other routes, require authentication
  try {
    const { supabase, response } = createClient(req);
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      // Redirect to home if not authenticated
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Allow authenticated requests to proceed
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/', req.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
