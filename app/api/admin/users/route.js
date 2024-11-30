import { createClient } from '../../../utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Create a Supabase client with service role for admin operations
const createAdminClient = (cookieStore) => {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            cookies: {
                get: (name) => cookieStore.get(name)?.value,
                set: (name, value, options) => cookieStore.set(name, value, options),
                remove: (name, options) => cookieStore.set(name, '', options),
            },
        }
    )
}

// Helper to verify admin status
async function verifyAdmin(supabase, userId) {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error('Error getting user:', error);
            throw new Error('Unauthorized: Admin access required');
        }
        
        if (!user?.user_metadata?.is_admin) {
            console.error('User is not admin:', user);
            throw new Error('Unauthorized: Admin access required');
        }

        console.log('Admin verified:', user.email);
    } catch (error) {
        console.error('Admin verification failed:', error);
        throw new Error('Unauthorized: Admin access required');
    }
}

// Create new user and whitelist them
export async function POST(req) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);
        const adminClient = createAdminClient(cookieStore);

        // Verify admin status
        await verifyAdmin(supabase);

        // Get current user for tracking
        const { data: { user: adminUser } } = await supabase.auth.getUser();

        // Get new user data from request
        const { email, password, username, creator_name, is_whitelisted = false } = await req.json();

        if (!email || !password || !username || !creator_name) {
            return NextResponse.json(
                { error: 'Email, password, username, and creator name are required' },
                { status: 400 }
            );
        }

        // Validate username
        if (! /^[a-zA-Z0-9_]{5,16}$/.test(username.toString()) || /\s/.test(username)) {
            return NextResponse.json(
                { error: 'Username must be greater than 5 characters long, contain only letters, numbers, and underscores, and have no spaces.' },
                { status: 400 }
            );
        }

        // Create user using admin client
        const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                is_whitelisted,
                created_by: adminUser.id,
                username: username.toLowerCase(),
                creator_name
            }
        });

        if (authError) {
            console.error('Error creating user:', authError);
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            );
        }

        // Initialize creator's page with default values
        const { error: creatorError } = await adminClient
            .from('creators_page')
            .insert({
                id: authUser.user.id,
                title: 'Welcome to the Creator Page',
                desc: 'This is a test description for the creator page',
                perks: JSON.stringify([{
                    name: 'Perk 1',
                    description: 'This is a test description for the first benefit'
                }, {
                    name: 'Perk 2',
                    description: 'This is a test description for the second benefit'
                }]),
                username: username.toLowerCase(),
                tiers: JSON.stringify([{
                    name: "Tier 1",
                    price: 1000,
                    description: "This is a test description for the first tier"
                }])
            });

        if (creatorError) {
            console.error('Error initializing creator page:', creatorError);
            // If creator page creation fails, delete the auth user
            await adminClient.auth.admin.deleteUser(authUser.user.id);
            return NextResponse.json(
                { error: 'Failed to initialize creator page' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'User created successfully',
            user: authUser.user
        });

    } catch (error) {
        console.error('Error in POST /api/admin/users:', error);
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
        const adminClient = createAdminClient(cookieStore);

        // Verify admin status
        await verifyAdmin(supabase);  

        // Get all users using admin client
        const { data: { users }, error } = await adminClient.auth.admin.listUsers();

        if (error) {
            console.error('Error listing users:', error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            users: users.map(user => ({
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
        const adminClient = createAdminClient(cookieStore);

        // Verify admin status
        await verifyAdmin(supabase);

        // Get current user for tracking
        const { data: { user: adminUser } } = await supabase.auth.getUser();

        // Get update data
        const { userId, is_whitelisted } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Get current user metadata
        const { data: { user }, error: getUserError } = await adminClient.auth.admin.getUserById(userId);
        if (getUserError) {
            console.error('Error getting user for update:', getUserError);
            return NextResponse.json(
                { error: getUserError.message },
                { status: 500 }
            );
        }

        // Update user metadata using admin client
        const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
            user_metadata: {
                ...user.user_metadata,
                is_whitelisted,
                updated_by: adminUser.id,
                updated_at: new Date().toISOString()
            }
        });

        if (updateError) {
            console.error('Error updating user:', updateError);
            return NextResponse.json(
                { error: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'User updated successfully'
        });

    } catch (error) {
        console.error('Error in PATCH /api/admin/users:', error);
        return NextResponse.json(
            { error: error.message },
            { status: error.message.includes('Unauthorized') ? 403 : 500 }
        );
    }
}
