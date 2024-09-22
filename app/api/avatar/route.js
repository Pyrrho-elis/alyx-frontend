import { createClient } from '@/app/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server';

export async function GET(req) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('creators_page')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ avatarUrl: data.avatar_url });
}