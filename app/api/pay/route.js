// app/api/pay/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
    const url = 'https://ye-buna.com/Pyrrho';

    // Hardcoded headers
    const headers = {
        'Cookie': 'PHPSESSID=ssi98hh78tc7oj3t1dfm3fufls; _ga=GA1.1.1086098526.1729094927; _ga_2W793Q1J51=GS1.1.1729094926.1.1.1729094993.0.0.0',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.6668.71 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://ye-buna.com',
        'Referer': 'https://ye-buna.com/Pyrrho',
    };

    const body = new URLSearchParams({
        amount: '1',
        subaccount_id: '6cdb6d07-eac7-4652-925b-00c78e4a94a0',
        user_id: '8957',
        supported: '',
        category: 'tip',
        social: '',
        message: '',
        tip: '',
    });

    try {
        // Send the POST request to the external URL
        const response = await axios.post(url, body.toString(), { headers });
        
        // Check if the response contains the redirect script
        const redirectMatch = response.data.match(/window\.location\.href='(.*?)'/);
        
        if (redirectMatch) {
            // Extract the redirect URL
            const redirectUrl = redirectMatch[1];
            return NextResponse.json({ redirectUrl });
        } else {
            return NextResponse.json({ message: 'No redirect found.' }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}