import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server'
import { cookies } from 'next/headers'
import { headers } from 'next/headers'

// Rate limiting configuration
const rateLimitMap = new Map();
const RATE_LIMIT_DURATION = 60000; // 1 minute
const MAX_REQUESTS = {
  GET: 30,  // 30 requests per minute for GET
  PUT: 10   // 10 requests per minute for PUT
};

// Allowed fields for update
const ALLOWED_FIELDS = ['title', 'desc', 'tiers', 'perks', 'youtube_video_id'];

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
    if (authError || !user) {
      return { valid: false, error: 'Unauthorized' };
    }

    // Check if this username matches the user's username in metadata
    if (username !== user.user_metadata?.username) {
      return { valid: false, error: 'Insufficient permissions' };
    }

    // For existing profiles, verify ownership
    const { data: profile, error: profileError } = await supabase
      .from('creators_page')
      .select('id, username')
      .eq('username', username)
      .single();

    if (profileError?.code === 'PGRST116') {
      // Profile doesn't exist yet - this is OK for new users
      return { valid: true, user, profile: null };
    }

    if (profile && profile.id !== user.id) {
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
      // Basic XSS prevention for string fields
      if (typeof data[field] === 'string') {
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
  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const headersList = headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';
  
  // Check rate limit for GET requests
  if (isRateLimited(ip, 'GET')) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: creator, error } = await supabase
      .from('creators_page')
      .select('id, username, title, desc, tiers, perks, youtube_video_id, avatar_url')
      .eq('username', username)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    return NextResponse.json(creator);
  } catch (error) {
    // Log error internally but don't expose details
    console.error('Error ID: ' + Date.now(), { type: 'GET_CREATOR_ERROR', username });
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
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Validate user authentication and permissions
    const { valid, error, user, profile } = await validateUser(supabase, username);
    if (!valid) {
      return NextResponse.json({ error }, { status: 401 });
    }

    // Validate and sanitize input data
    const rawData = await req.json();
    const sanitizedData = sanitizeUpdateData(rawData);

    if (Object.keys(sanitizedData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    let result;
    if (!profile) {
      // Create new profile
      const { data: newProfile, error: createError } = await supabase
        .from('creators_page')
        .insert([{
          ...sanitizedData,
          username,
          id: user.id
        }])
        .select()
        .single();

      if (createError) {
        console.error('Profile creation error:', createError);
        throw new Error('Failed to create profile');
      }
      result = newProfile;
    } else {
      // Update existing profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('creators_page')
        .update(sanitizedData)
        .eq('username', username)
        .select()
        .single();

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error('Failed to update profile');
      }
      result = updatedProfile;
    }

    return NextResponse.json({ 
      message: profile ? 'Profile updated successfully' : 'Profile created successfully',
      data: result
    });
  } catch (error) {
    // Log error internally but don't expose details
    console.error('Error ID: ' + Date.now(), { 
      type: 'UPDATE_CREATOR_ERROR',
      username,
      error: error.message 
    });
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}