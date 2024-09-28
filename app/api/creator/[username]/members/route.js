import { NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(req, { params }) {
    const { username } = params;
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    try {
        const {data: members, error} = await supabase
            .from('subscriptions')
            .select('*')
            .eq('creator_id', username)
            .order('created_at', { ascending: false })
            .limit(50)
        if (error) throw error;

        return NextResponse.json(members);
    } catch (error) {
        console.error("Error fetching creator members:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const { username } = params;
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { userId } = await req.json()

    try {
        const { error } = await supabase
            .from('subscriptions')
            .update({ active: "expired" })
            .eq('id', userId)
            .eq('creator_id', username)

        if (error) throw error;

        return NextResponse.json({ message: "User subscription deleted successfully" });
    } catch (error) {
        console.error("Error deleting user subscription:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}