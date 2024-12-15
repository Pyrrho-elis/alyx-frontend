import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from './app/utils/supabase/middleware';

// Routes that are public (no auth required)
const PUBLIC_ROUTES = [
  '/login', // Allow access to login page
  '/waitlist',
  '/pay',
  '/paytest',
  '/creator',
  '/',
  '/learn-more',
//   '/contact',
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

// Middleware to check if user is whitelisted
async function isWhitelisted(supabase, adminClient) {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        // Get full user data using admin client
        const { data: { user: userData }, error: getUserError } = await adminClient.auth.admin.getUserById(user.id);
        if (getUserError) throw getUserError;

        console.log('Checking whitelist status for user:', user.id);
        console.log('User metadata:', userData.user_metadata);

        return userData.user_metadata?.is_whitelisted === true || userData.user_metadata?.is_admin === true;
    } catch (error) {
        console.error('Error checking whitelist status:', error);
        return false;
    }
}

export async function middleware(req) {
    // Create response to modify
    let response = NextResponse.next();

    try {
        // Initialize Supabase client
        const supabase = createClient(req);
        const adminClient = createAdminClient();

        // Get session
        const {
            data: { session },
        } = await supabase.auth.getSession();

        const pathname = req.nextUrl.pathname;

        // Bypass middleware for static assets and system routes
        if (BYPASS_ROUTES.some(route => pathname.startsWith(route))) {
            return NextResponse.next();
        }

        // Check if it's a public route
        const isPublicRoute = PUBLIC_ROUTES.some(route =>
            pathname === route ||
            pathname === `${route}/` ||
            (route === '/creator' && pathname.startsWith(route))
        );
        const isPublicApiRoute = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));

        if (isPublicRoute || isPublicApiRoute) {
            return response;
        }

        // If no session, redirect to login
        if (!session) {
            // Store the attempted URL to redirect back after login
            const redirectUrl = new URL('/login', req.url);
            redirectUrl.searchParams.set('redirectTo', pathname);
            return NextResponse.redirect(redirectUrl);
        }

        // For protected routes, check whitelist status
        const whitelisted = await isWhitelisted(supabase, adminClient);
        console.log('Whitelist check result:', whitelisted);

        if (!whitelisted) {
            console.log('Access denied for non-whitelisted user:', session.user.id);
            return NextResponse.redirect(new URL('/waitlist', req.url));
        }

        // Check if user is admin first - if they are, allow access to everything
        if (session.user.user_metadata?.is_admin) {
            return response;
        }

        return response;

    } catch (error) {
        console.error('Middleware error:', error);
        return response;
    }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
