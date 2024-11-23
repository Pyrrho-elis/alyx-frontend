import { NextResponse } from 'next/server';
import { createClient } from './app/utils/supabase/middleware';

// Routes that are public (no auth required)
const PUBLIC_ROUTES = [
  '/login', // Allow access to login page
  '/waitlist',
  '/pay',
  '/paytest',
  '/creator',
  '/',
  '/learn-more',
  '/contact',
  '/admin'  // Adding admin route as public
];

// API routes that are public
const PUBLIC_API_ROUTES = [
  '/api/pay',
  '/api/proxy',
  '/api/verify-payment-token',
  '/api/store-subscriber',
  '/api/check-subscription',
  '/api/get-early-access',
  '/api/auth'  // Add auth endpoint to public routes
];

// Admin routes (requires special admin flag)
const ADMIN_ROUTES = [
  '/admin'
];

// Static assets and system routes that bypass middleware
const BYPASS_ROUTES = [
  '/_next',
  '/fonts',
  '/images',
  '/favicon.ico',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml'
];

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;

  // Bypass middleware for static assets and system routes
  if (BYPASS_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow public routes
  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    pathname === route ||
    pathname === `${route}/` ||
    (route === '/creator' && pathname.startsWith(route))
  );
  const isPublicApiRoute = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));

  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // For all other routes, check authentication
  try {
    const { supabase, response } = createClient(req);

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      // Store the attempted URL to redirect back after login
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user is admin first - if they are, allow access to everything
    // const { data: userData, error: userDataError } = await supabase
    //   .from('users')
    //   .select('is_admin, is_whitelisted')
    //   .eq('id', user.id)
    //   .single();

    // console.log(userData)
    // If user is admin, allow access to everything
    console.log("User:", user)
    if (user?.user_metadata?.is_admin) {
      return response;
    }

    // For non-admin users, check whitelist status
    if (!user?.user_metadata?.is_whitelisted) {
      console.log('Access denied for non-whitelisted user:', user.id);
      return NextResponse.redirect(new URL('/waitlist', req.url));
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/', req.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
