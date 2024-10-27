import { NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { user_id, creator_id } = req.body;

    try {
        const { data: subscriber, error } = await supabase
            .from('subscription_requests')
            .update( {
                status: 'active',
            })
            .eq('creator_id', creator_id)
            .eq('user_id', user_id)
            .single();

        if (error) throw error;
    } catch (error) {
        console.error('Error storing subscriber:', error);
        return NextResponse.json({ error: 'Failed to store subscriber' }, { status: 500 });
    }

    return new NextResponse(JSON.stringify({ success: true }));
}