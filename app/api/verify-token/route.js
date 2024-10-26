import { NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { integrationCode, userId } = await req.json()

    try {
        const { data: integrations, error } = await supabase
            .from('group_integrations')
            .select('*')
            .eq('integration_code', integrationCode)
            .gte('created_at', new Date().toISOString());

        if (error) throw error;

        if (!integrations.length) {
            console.log('Invalid integration code');
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const { data: existingGroup } = await supabase
            .from('creators_page')
            .select('*')
            .eq('telegram_group_id', integrations[0].group_id)
            .single();

        if (existingGroup || integrations[0].status !== 'pending') {
            return NextResponse.json(
                { error: 'This group is already linked to another creator' },
                { status: 400 }
            );
        }

        const { error: updateError } = await supabase
            .from('creators_page')
            .update({ telegram_group_id: integrations[0].group_id })
            .eq('id', userId);

        if (updateError) {
            throw updateError;
        }

        // Mark integration as complete
        await supabase
            .from('group_integrations')
            .update({
                status: 'completed',
                creator_id: userId,
                completed_at: new Date().toISOString()
            })
            .eq('integration_code', integrationCode);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Integration error:', error);
        return NextResponse.json(
            { error: 'Failed to link group' },
            { status: 500 }
        );
    }
}
