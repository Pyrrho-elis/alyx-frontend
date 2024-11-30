// app/api/pay/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export async function GET(request) {
    // For testing, redirect to POST handler
    return POST(request);
}

export async function POST(request) {
    try {
        const url = 'https://ye-buna.com/Pyrrho';
        
        // Parse request body safely
        let requestData;
        try {
            requestData = await request.json();
        } catch (error) {
            console.error('Failed to parse request body:', error);
            return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
        }

        if (!requestData || !requestData.token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        const { token } = requestData;
        console.log('Received token:', token);
        const origin = request.headers.get('origin');
        console.log('Origin:', origin);

        // Get creator data
        const creatorData = await getCreatorData(token, origin);
        console.log('Creator data received:', creatorData);
        
        if (!creatorData || !creatorData.tiers) {
            console.error('Invalid creator data:', creatorData);
            return NextResponse.json({ error: 'Invalid creator data structure' }, { status: 400 });
        }

        // Parse tiers safely
        let parsedTiers;
        try {
            parsedTiers = typeof creatorData.tiers === 'string' 
                ? JSON.parse(creatorData.tiers) 
                : creatorData.tiers;
        } catch (error) {
            console.error('Error parsing tiers:', error);
            return NextResponse.json({ error: 'Invalid tiers format' }, { status: 400 });
        }

        // Get first tier price
        const firstTier = Array.isArray(parsedTiers) 
            ? parsedTiers[0] 
            : Object.values(parsedTiers)[0];
            
        if (!firstTier || !firstTier.price) {
            console.error('Invalid tier structure:', firstTier);
            return NextResponse.json({ error: 'Invalid tier price' }, { status: 400 });
        }

        const amount = firstTier.price;
        console.log('Amount:', amount);

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
            console.error('Payment request failed:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in POST handler:', error);
        return NextResponse.json({ 
            error: 'Payment initialization failed', 
            details: error.message || 'Unknown error'
        }, { status: 500 });
    }
}

const getCreatorData = async (token, origin) => {
    try {
        const userData = jwt.verify(token, process.env.SERVER_JWT_SECRET);
        console.log('User data:', userData);
        console.log('User ID:', userData.user_id);
        console.log('Creator ID:', userData.creator_id);
        
        if (!userData.user_id) {
            throw new Error('Invalid user ID in token');
        }
        
        const creatorEndpoint = `${origin}/api/creator/${userData.creator_id}`;
        console.log('Fetching from:', creatorEndpoint);
        
        const response = await fetch(creatorEndpoint);
        console.log('Creator API Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch creator data: ${response.status}`);
        }
        
        const creatorData = await response.json();
        console.log('Creator data:', creatorData);
        return creatorData;

    } catch (error) {
        console.error('Error in getCreatorData:', error.message);
        throw error;
    }
}