import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const botToken = process.env.BOT_TOKEN;
        
        if (!botToken) {
            console.error('Bot token not configured');
            return NextResponse.json({ 
                ok: false,
                error: 'Bot token not configured. Please contact support.' 
            }, { status: 500 });
        }

        const { chatId } = await req.json();
        
        if (!chatId) {
            return NextResponse.json({ 
                ok: false,
                error: 'Chat ID is required' 
            }, { status: 400 });
        }

        const baseUrl = `https://api.telegram.org/bot${botToken}`;
        
        // Get chat info from Telegram
        const chatResponse = await fetch(`${baseUrl}/getChat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ chat_id: chatId })
        });

        const chatData = await chatResponse.json();

        if (!chatResponse.ok) {
            console.error('Telegram API error:', chatData);
            return NextResponse.json({ 
                ok: false,
                error: chatData.description || 'Failed to fetch chat info'
            }, { status: chatResponse.status });
        }

        // Get member count
        const memberCountResponse = await fetch(`${baseUrl}/getChatMemberCount`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ chat_id: chatId })
        });

        const memberCountData = await memberCountResponse.json();

        // Get chat administrators
        const adminsResponse = await fetch(`${baseUrl}/getChatAdministrators`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ chat_id: chatId })
        });

        const adminsData = await adminsResponse.json();

        // Remove invite_link from the response and combine all data
        const { invite_link, ...chatInfo } = chatData.result;
        const combinedData = {
            ok: true,
            result: {
                ...chatInfo,
                member_count: memberCountData.ok ? memberCountData.result : null,
                administrators: adminsData.ok ? adminsData.result : []
            }
        };

        return NextResponse.json(combinedData);
    } catch (error) {
        console.error('Error in getChat:', error);
        return NextResponse.json({ 
            ok: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
