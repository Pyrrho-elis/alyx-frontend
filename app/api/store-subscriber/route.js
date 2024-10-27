import { NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { user_id, creator_id } = await req.json();

    console.log(user_id, creator_id)

    try {
        const { data: subscriber, error } = await supabase
            .from('subscription_requests')
            .update({
                status: 'active',
            })
            .eq('creator_id', creator_id)
            .eq('user_id', user_id)

        if (error) throw error;
        onBoarding(creator_id, user_id, supabase);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error storing subscriber:', error);
        return NextResponse.json({ error: 'Failed to store subscriber' }, { status: 500 });
    }

    return new NextResponse(JSON.stringify({ success: true }));
}

async function onBoarding(creator_id, user_id, supabase) {
    try {
        const { data: creator, error } = await supabase
            .from('creators_page')
            .select('*')
            .eq('username', creator_id)
            .single();
        if (error) {
            console.log(error);
            return new NextResponse(JSON.stringify({ error: error.message }));
        }
        const creatorGroupId = creator.telegram_group_id;
        if (!creatorGroupId) {
            console.log('No creator group id found');
            return new NextResponse(JSON.stringify({ error: 'No creator group id found' }));
        }
        const inviteLink = await createInviteLink(creatorGroupId);
        sendMessage(user_id, `You have successfully subscribed to ${creator.username}! Click the link below to join the group:`);
        sendMessage(user_id, inviteLink);
    } catch (error) {
        console.error('Error storing subscriber:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to store subscriber' }), { status: 500 });
    }
}

const createInviteLink = async (group_id) => {
    try {
        const botToken = process.env.NEXT_PUBLIC_BOT_TOKEN;
        const baseUrl = `https://api.telegram.org/bot${botToken}`;
        const expirationTimestamp = Math.floor(Date.now() / 1000) + 30 * 60;  // 30 minutes from now
        const response = await fetch(`${baseUrl}/createChatInviteLink`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: group_id,
                expire_date: expirationTimestamp,
                member_limit: 1,  // One-time use
            }),
        });
        const data = await response.json();

        if (data.ok) {
            return data.result.invite_link;
        } else {
            console.error('Error creating invite link:', data);
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

const sendMessage = async (user_id, message) => {
    try {
        const botToken = process.env.NEXT_PUBLIC_BOT_TOKEN;
        const baseUrl = `https://api.telegram.org/bot${botToken}`;
        const response = await fetch(`${baseUrl}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: user_id,
                text: message,
                parse_mode: 'Markdown',
            }),
        });
        const data = await response.json();

        if (data.ok) {
            return data.result;
        } else {
            console.error('Error sending message:', data);
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}