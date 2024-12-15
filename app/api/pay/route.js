// app/api/pay/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';

// Create a single supabase client for interacting with your database
const createServerSupabase = (cookieStore) => {
    return createClient(cookieStore);
};

export async function POST(request) {
    try {
        const { token } = await request.json();
        
        if (!token) {
            return NextResponse.json({ error: 'Payment token is required' }, { status: 400 });
        }

        try {
            // Verify token
            const userData = jwt.verify(token, process.env.SERVER_JWT_SECRET);
            
            // Get creator data to get tier price
            const cookieStore = cookies();
            const supabase = createServerSupabase(cookieStore);
            const { data: creator, error } = await supabase
                .from('creators_page')
                .select('id, username, tiers')
                .eq('username', userData.creator_id)
                .single();

            if (error || !creator) {
                console.error('Error fetching creator:', error);
                return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
            }

            // Get tier price
            const tiers = typeof creator.tiers === 'string' ? JSON.parse(creator.tiers) : creator.tiers;
            const tierPrice = tiers["0"].price; // Currently only one tier
            
            if (!tierPrice) {
                return NextResponse.json({ error: 'Invalid tier price' }, { status: 400 });
            }

            const url = 'https://ye-buna.com/Pyrrho';
            
            // Form data
            const body = new URLSearchParams({
                amount: tierPrice,
                subaccount_id: '6cdb6d07-eac7-4652-925b-00c78e4a94a0',
                supported: '',
                category: 'tip',
                social: '',
                message: '',
                tip: ''
            });

            // Send POST request to ye-buna
            const response = await axios.post(url, body.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.6668.71 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Origin': 'https://ye-buna.com',
                    'Referer': 'https://ye-buna.com/Pyrrho'
                }
            });
            
            // Extract redirect URL from response
            const redirectMatch = response.data.match(/window\.location\.href='(.*?)'/);
            
            if (redirectMatch) {
                const redirectUrl = redirectMatch[1];
                return NextResponse.json({ redirectUrl });
            }

            throw new Error('Failed to get payment URL');

        } catch (error) {
            console.error('Payment error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    } catch (error) {
        console.error('Payment request error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}