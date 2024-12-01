// app/api/pay/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
    try {
        const url = 'https://ye-buna.com/Pyrrho';
        const amount = 11; // Fixed amount for testing
        
        // Hardcoded headers for ye-buna
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.6668.71 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://ye-buna.com',
            'Referer': 'https://ye-buna.com/Pyrrho'
        };

        // Form data
        const body = new URLSearchParams({
            amount: amount,
            subaccount_id: '6cdb6d07-eac7-4652-925b-00c78e4a94a0',
            user_id: '8957',
            supported: '',
            category: 'tip',
            social: '',
            message: '',
            tip: '',
        });

        try {
            // Send POST request to ye-buna
            const response = await axios.post(url, body.toString(), { headers });
            
            // Extract redirect URL from response
            const redirectMatch = response.data.match(/window\.location\.href='(.*?)'/);
            
            if (redirectMatch) {
                const redirectUrl = redirectMatch[1];
                return NextResponse.json({ redirectUrl });
            } else {
                return NextResponse.json({ error: 'No redirect URL found' }, { status: 400 });
            }
        } catch (error) {
            console.error('Payment request failed:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in payment handler:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}