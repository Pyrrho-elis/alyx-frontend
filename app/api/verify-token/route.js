import { NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    try {
        const { integrationCode, userId } = await req.json()

        // Input validation
        if (!integrationCode || typeof integrationCode !== 'string') {
            return NextResponse.json({ 
                error: "Integration code is required and must be a string" 
            }, { status: 400 });
        }

        if (!userId) {
            return NextResponse.json({ 
                error: "User ID is required" 
            }, { status: 400 });
        }

        // Verify user exists and has permissions
        const { data: user, error: userError } = await supabase
            .from('creators_page')
            .select('id')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            console.error('User verification error:', userError);
            return NextResponse.json({ 
                error: "Invalid user or insufficient permissions" 
            }, { status: 403 });
        }

        // Check integration code
        const { data: integrations, error: integrationError } = await supabase
            .from('group_integrations')
            .select('*')
            .eq('integration_code', integrationCode)

        if (integrationError) {
            console.error('Integration lookup error:', integrationError);
            return NextResponse.json({ 
                error: "Failed to verify integration code" 
            }, { status: 500 });
        }

        if (!integrations.length) {
            console.log('Invalid integration code:', integrationCode);
            return NextResponse.json({ 
                error: "Invalid integration code" 
            }, { status: 401 });
        }

        // Check if group is already linked
        const { data: existingGroup, error: groupError } = await supabase
            .from('creators_page')
            .select('username')
            .eq('telegram_group_id', integrations[0].group_id)
            .single();

        if (groupError && groupError.code !== 'PGRST116') { // PGRST116 means no rows found
            console.error('Group lookup error:', groupError);
            return NextResponse.json({ 
                error: "Failed to verify group status" 
            }, { status: 500 });
        }

        if (existingGroup) {
            return NextResponse.json({ 
                error: `This group is already linked to creator: ${existingGroup.username}` 
            }, { status: 400 });
        }

        if (integrations[0].status !== 'pending') {
            return NextResponse.json({ 
                error: "This integration code has already been used" 
            }, { status: 400 });
        }

        // Update creator's group ID
        const { error: updateError } = await supabase
            .from('creators_page')
            .update({ telegram_group_id: integrations[0].group_id })
            .eq('id', userId);

        if (updateError) {
            console.error('Creator update error:', updateError);
            return NextResponse.json({ 
                error: "Failed to link group to creator" 
            }, { status: 500 });
        }

        // Mark integration as complete
        const { error: completeError } = await supabase
            .from('group_integrations')
            .update({
                status: 'completed',
                creator_id: userId,
                completed_at: new Date().toISOString()
            })
            .eq('integration_code', integrationCode);

        if (completeError) {
            console.error('Integration completion error:', completeError);
            // Attempt to rollback the creator update
            await supabase
                .from('creators_page')
                .update({ telegram_group_id: null })
                .eq('id', userId);
                
            return NextResponse.json({ 
                error: "Failed to complete integration" 
            }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true,
            message: "Group successfully linked to your account"
        });
    } catch (error) {
        console.error('Integration error:', error);
        return NextResponse.json({ 
            error: "An unexpected error occurred while processing your request" 
        }, { status: 500 });
    }
}
