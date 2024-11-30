import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        const botToken = process.env.BOT_TOKEN;
        
        if (!botToken) {
            console.error('Bot token not configured');
            return NextResponse.json({ 
                ok: false,
                error: 'Bot token not configured. Please contact support.' 
            }, { status: 500 });
        }

        const baseUrl = `https://api.telegram.org/bot${botToken}`;
        
        try {
            // Get bot info to verify token
            const response = await fetch(`${baseUrl}/getMe`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Telegram API error:', errorData);
                throw new Error(errorData.description || 'Failed to verify bot token');
            }

            const data = await response.json();
            
            if (!data.ok || !data.result || !data.result.username) {
                throw new Error('Invalid bot data received from Telegram');
            }

            return NextResponse.json({
                ok: true,
                botToken: data.result.username  // Return username for bot URL
            });

        } catch (error) {
            console.error('Error verifying bot:', error);
            return NextResponse.json({ 
                ok: false, 
                error: error.message || 'Failed to verify bot token'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ 
            ok: false,
            error: 'An unexpected error occurred'
        }, { status: 500 });
    }
}
