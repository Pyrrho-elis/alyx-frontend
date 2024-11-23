import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        const botToken = process.env.BOT_TOKEN;
        const baseUrl = `https://api.telegram.org/bot${botToken}`;
        
        // Get bot info to verify token
        const response = await fetch(`${baseUrl}/getMe`);
        const data = await response.json();
        
        if (!data.ok) {
            throw new Error('Failed to verify bot token');
        }
        
        return NextResponse.json({ 
            ok: true,
            botUsername: data.result.username 
        });
    } catch (error) {
        console.error('Bot verification error:', error);
        return NextResponse.json({ 
            ok: false, 
            error: 'Failed to verify bot token' 
        }, { status: 500 });
    }
}
