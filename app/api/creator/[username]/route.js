import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies, headers } from 'next/headers';

// Create a single supabase client for interacting with your database
const createServerSupabase = (cookieStore) => {
  return createClient(cookieStore);
};

// Rate limiting configuration
const rateLimitMap = new Map();
const RATE_LIMIT_DURATION = 60000; // 1 minute
const MAX_REQUESTS = {
  GET: 30,  // 30 requests per minute for GET
  PUT: 10   // 10 requests per minute for PUT
};

// Allowed fields for update
const ALLOWED_FIELDS = [
  'title', 
  'desc', 
  'tiers', 
  'perks', 
  'youtube_video_id', 
  'isActive',
  'avatar_url',
];

function isRateLimited(ip, method) {
  const now = Date.now();
  const key = `${ip}-${method}`;
  const userRequests = rateLimitMap.get(key) || [];
  
  // Clean up old requests
  const recentRequests = userRequests.filter(timestamp => 
    now - timestamp < RATE_LIMIT_DURATION
  );
  
  // Check if user has exceeded rate limit
  if (recentRequests.length >= MAX_REQUESTS[method]) {
    return true;
  }
  
  // Add new request timestamp
  recentRequests.push(now);
  rateLimitMap.set(key, recentRequests);
  return false;
}

async function validateUser(supabase, username) {
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Auth error:', authError);
      return { valid: false, error: 'Unauthorized - Auth Error' };
    }
    if (!user) {
      console.error('No user found');
      return { valid: false, error: 'Unauthorized - No User' };
    }

    // For existing profiles, verify ownership
    const { data: profile, error: profileError } = await supabase
      .from('creators_page')
      .select('id')
      .eq('username', username)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // Profile doesn't exist yet - this is OK for new users
        return { valid: true, user, profile: null };
      }
      console.error('Profile error:', profileError);
      return { valid: false, error: 'Failed to verify profile' };
    }

    // Check if this username matches the user's profile
    if (profile && profile.id !== user.id) {
      console.log('Profile user ID:', profile.user_id);
      console.log('User ID:', user.id);
      return { valid: false, error: 'Insufficient permissions' };
    }

    return { valid: true, user, profile };
  } catch (error) {
    console.error('Auth error:', error);
    return { valid: false, error: 'Authentication failed' };
  }
}

function sanitizeUpdateData(data) {
  const sanitized = {};
  for (const field of ALLOWED_FIELDS) {
    if (data[field] !== undefined) {
      if (field === 'tiers' || field === 'perks') {
        // These fields should already be parsed as objects
        sanitized[field] = data[field];
      } else if (typeof data[field] === 'string') {
        // Basic XSS prevention for string fields
        sanitized[field] = data[field]
          .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
          .trim();
      } else {
        sanitized[field] = data[field];
      }
    }
  }
  return sanitized;
}

export async function GET(req, { params }) {
  const { username } = params;
  console.log('GET /api/creator - Username:', username);

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const headersList = headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';
  
  // Check rate limit for GET requests
  if (isRateLimited(ip, 'GET')) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    console.log('Querying Supabase for creator:', username);
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    const cookieStore = cookies();
    const supabase = createServerSupabase(cookieStore);
    const { data: creator, error } = await supabase
      .from('creators_page')
      .select('id, username, title, desc, tiers, perks, youtube_video_id, avatar_url, isActive, telegram_group_id')
      .eq('username', username)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (!creator) {
      console.log('No creator found for username:', username);
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    console.log('Creator found:', creator);
    return NextResponse.json(creator);
  } catch (error) {
    console.error('Error fetching creator:', error);
    return NextResponse.json({ error: 'Failed to fetch creator profile' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { username } = params;
  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const headersList = headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';
  
  // Check rate limit for PUT requests
  if (isRateLimited(ip, 'PUT')) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const cookieStore = cookies();
    const supabase = createServerSupabase(cookieStore);
    const validation = await validateUser(supabase, username);
    
    if (!validation.valid) {
      console.error('Validation failed:', validation.error);
      return NextResponse.json({ error: validation.error }, { status: 403 });
    }

    let data;
    try {
      data = await req.json();
    } catch (e) {
      console.error('JSON parse error:', e);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // data.updated_at = new Date().toISOString();
    
    const sanitizedData = sanitizeUpdateData(data);

    if (Object.keys(sanitizedData).length === 0) {
      return NextResponse.json({ 
        error: 'No valid fields to update',
        allowed: ALLOWED_FIELDS 
      }, { status: 400 });
    }

    // If trying to set isActive to true, check for telegram_group_id
    if (sanitizedData.isActive === true) {
      const { data: creatorData } = await supabase
        .from('creators_page')
        .select('telegram_group_id')
        .eq('username', username)
        .single();

      if (!creatorData?.telegram_group_id) {
        return NextResponse.json({ 
          error: 'Cannot publish profile without a linked Telegram group',
          code: 'TELEGRAM_GROUP_REQUIRED'
        }, { status: 400 });
      }
    }

    const { data: updateData, error: updateError } = await supabase
      .from('creators_page')
      .update(sanitizedData)
      .eq('username', username)
      .select()
      .single();

    if (updateError) {
      console.error('Database error:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update data',
        details: updateError.message,
        code: updateError.code
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      data: updateData
    });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}