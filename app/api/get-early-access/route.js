import { NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { cookies } from 'next/headers'
import { headers } from 'next/headers'

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Rate limiting map (in a production environment, use Redis or similar)
const rateLimitMap = new Map();
const RATE_LIMIT_DURATION = 3600000; // 1 hour in milliseconds
const MAX_REQUESTS = 5; // Maximum requests per hour

function isRateLimited(ip) {
    const now = Date.now();
    const userRequests = rateLimitMap.get(ip) || [];
    
    // Clean up old requests
    const recentRequests = userRequests.filter(timestamp => 
        now - timestamp < RATE_LIMIT_DURATION
    );
    
    // Check if user has exceeded rate limit
    if (recentRequests.length >= MAX_REQUESTS) {
        return true;
    }
    
    // Add new request timestamp
    recentRequests.push(now);
    rateLimitMap.set(ip, recentRequests);
    return false;
}

export async function POST(request) {
    try {
        // Get client IP for rate limiting
        const headersList = headers();
        const ip = headersList.get('x-forwarded-for') || 'unknown';
        
        // Check rate limit
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const { email } = await request.json();

        // Validate email format
        if (!email || !EMAIL_REGEX.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Initialize Supabase client
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        // Check for existing email
        const { data: existingEmail } = await supabase
            .from('waitlist')
            .select('email')
            .eq('email', email.toLowerCase())
            .single();

        if (existingEmail) {
            return NextResponse.json(
                { message: 'Email already registered' },
                { status: 200 }
            );
        }

        // Insert email into waitlist table
        const { error } = await supabase
            .from('waitlist')
            .insert([{ 
                email: email.toLowerCase(),
            }]);

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Failed to join waitlist' },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            message: 'Successfully joined waitlist',
            status: 'success'
        });
    } catch (error) {
        console.error('Error adding to waitlist:', error);
        return NextResponse.json(
            { error: 'Failed to join waitlist' },
            { status: 500 }
        );
    }
}
