import { createClient } from '../../../utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Helper to verify admin status
async function verifyAdmin(supabase, userId) {
  const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
  if (error || !user?.user_metadata?.is_admin) {
    throw new Error('Unauthorized: Admin access required');
  }
}

// Create new user and whitelist them
export async function POST(req) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    // Verify the current user is an admin
    const { data: { user: adminUser } } = await supabase.auth.getUser();
    await verifyAdmin(supabase, adminUser.id);

    // Get new user data from request
    const { email, password, is_whitelisted = false } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create user in Auth with metadata
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        is_whitelisted,
        created_by: adminUser.id
      }
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: 'User created successfully',
      user: authUser.user
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

// Get all users
export async function GET(req) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    // Verify admin status
    const { data: { user: adminUser } } = await supabase.auth.getUser();
    await verifyAdmin(supabase, adminUser.id);

    // Get all users from auth.users
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      users: users.users.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        is_whitelisted: user.user_metadata?.is_whitelisted || false,
        is_admin: user.user_metadata?.is_admin || false
      }))
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

// Update user status
export async function PATCH(req) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    // Verify admin status
    const { data: { user: adminUser } } = await supabase.auth.getUser();
    await verifyAdmin(supabase, adminUser.id);

    // Get update data
    const { userId, is_whitelisted } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get current user metadata
    const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    if (getUserError) {
      return NextResponse.json(
        { error: getUserError.message },
        { status: 500 }
      );
    }

    // Update user metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...user.user_metadata,
        is_whitelisted,
        updated_by: adminUser.id,
        updated_at: new Date().toISOString()
      }
    });

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'User updated successfully' 
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
