export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';
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
async function verifyAdmin(supabase) {
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

export async function GET() {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);
        const adminClient = createAdminClient(cookieStore);

        // Verify admin status
        await verifyAdmin(supabase);

        // Get all withdrawals
        const { data: withdrawals, error: withdrawalsError } = await adminClient
            .from('withdrawals')
            .select('*')
            .order('created_at', { ascending: false });

        console.log('Withdrawals data:', withdrawals);
        if (withdrawalsError) {
            console.error('Withdrawals error:', withdrawalsError);
            throw withdrawalsError;
        }

        // Get all users data using admin API
        const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers();

        if (usersError) {
            console.error('Error fetching users:', usersError);
            throw usersError;
        }

        // Create a map of user data by username
        const userMap = users.reduce((acc, user) => {
            if (user.user_metadata?.username) {
                acc[user.user_metadata.username] = user;
            }
            return acc;
        }, {});

        // Combine withdrawal data with user data
        const withdrawalsWithUserData = withdrawals.map(withdrawal => ({
            ...withdrawal,
            user: {
                email: userMap[withdrawal.creator_id]?.email || '',
                username: withdrawal.creator_id || 'Unknown'
            }
        }));

        return NextResponse.json(withdrawalsWithUserData);
    } catch (error) {
        console.error('Error fetching withdrawals:', error);
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }
        return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 });
    }
}
