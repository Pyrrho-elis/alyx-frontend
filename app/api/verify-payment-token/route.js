// app/api/verify-payment-token/route.js

import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(req, res) {
    const { token, action, response } = await req.json();



    switch (action) {
        case 'verify':
            try {
                const userData = jwt.verify(token, process.env.SERVER_JWT_SECRET);
                return NextResponse.json({ message: 'Token verified successfully', data: userData }, { status: 200 });
            } catch (error) {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
        case 'subscribe':
            if (!token || !action || !response) {
                return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
            }
            if (response.status === 1) {
                // Successful payment
                const userData = jwt.verify(token, process.env.SERVER_JWT_SECRET);
                const { user_id: userId, creator_id } = userData;
                console.log('User ID:', userId);
                console.log('Creator ID:', creator_id);
                const storeResponse = fetch(`${req.headers.get('origin')}/api/store-subscriber`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId,
                        creator_id
                    })
                });
                if (!storeResponse.ok) {
                    throw new Error('Failed to store subscriber');
                }
                const data = await storeResponse.json();
                return NextResponse.json({ message: 'Subscription activated successfully' }, { status: 200 });
            } else if (response.status === 0) {
                // Pending payment
                return NextResponse.json({ message: 'Payment pending' }, { status: 200 });
            } else {
                // Failed payment
                return NextResponse.json({ message: 'Payment failed' }, { status: 200 });
            }
        default:
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
}