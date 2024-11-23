import { NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { user_id, creator_id } = await req.json();

    try {
        // Check active subscriptions
        const { data: activeSubscription, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('creator_id', creator_id)
            .eq('user_id', user_id)
            .eq('status', 'active')
            .single();

        if (activeSubscription) {
            return NextResponse.json({ 
                hasSubscription: true,
                subscription: activeSubscription 
            });
        }

        // Check pending subscription requests
        const { data: pendingRequest, error: reqError } = await supabase
            .from('subscription_requests')
            .select('*')
            .eq('creator_id', creator_id)
            .eq('user_id', user_id)
            .eq('status', 'pending')
            .single();

        return NextResponse.json({ 
            hasSubscription: false,
            hasPendingRequest: !!pendingRequest 
        });
    } catch (error) {
        console.error('Error checking subscription:', error);
        return NextResponse.json({ error: 'Failed to check subscription' }, { status: 500 });
    }
}
