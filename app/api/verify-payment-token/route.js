// app/api/verify-payment-token/route.js

import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req, res) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { token, action, response } = await req.json();

    switch (action) {
        case 'verify':
            try {
                const userData = jwt.verify(token, process.env.SERVER_JWT_SECRET);
                console.log('Checking subscription for user:', userData.user_id);

                // Check for active subscription
                const { data: subscriptions, error: subError } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('telegram_user_id', userData.user_id)
                    .eq('creator_id', userData.creator_id)
                    .eq('status', 'active')
                    .gte('expiration_date', new Date().toISOString());

                if (subError) {
                    console.error('Error checking subscription:', subError);
                    throw new Error('Failed to check subscription status');
                }

                console.log('Found subscriptions:', subscriptions);

                // Check if any active subscription exists
                const hasActiveSubscription = subscriptions && subscriptions.length > 0;
                const activeSubscription = hasActiveSubscription ? subscriptions[0] : null;

                console.log('Has active subscription:', hasActiveSubscription);
                
                return NextResponse.json({ 
                    message: 'Token verified successfully', 
                    data: {
                        user_id: userData.user_id,
                        creator_id: userData.creator_id,
                        first_name: userData.first_name,
                        has_active_subscription: hasActiveSubscription,
                        subscription: activeSubscription
                    }
                }, { status: 200 });
            } catch (error) {
                console.error('Verification error:', error);
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
        case 'subscribe':
            if (!token || !action || !response) {
                return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
            }
            if (response.status === 1) {
                // Successful payment
                try {
                    const userData = jwt.verify(token, process.env.SERVER_JWT_SECRET);
                    console.log('Checking existing subscription for:', userData.user_id);
                    
                    // Check for active subscription before storing
                    const { data: subscriptions, error: checkError } = await supabase
                        .from('subscriptions')
                        .select('*')
                        .eq('telegram_user_id', userData.user_id)
                        .eq('creator_id', userData.creator_id)
                        .eq('status', 'active')
                        .gte('expiration_date', new Date().toISOString());

                    if (checkError) {
                        console.error('Error checking existing subscription:', checkError);
                        throw new Error('Failed to check existing subscription');
                    }

                    if (subscriptions && subscriptions.length > 0) {
                        console.log('Found existing subscription:', subscriptions[0]);
                        return NextResponse.json({ 
                            message: 'Already have active subscription',
                            data: subscriptions[0]
                        }, { status: 200 });
                    }
                    
                    // Store subscriber if no active subscription
                    console.log('No active subscription found, creating new one...');
                    const storeResponse = await fetch(`${req.headers.get('origin')}/api/store-subscriber`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            user_id: userData.user_id,
                            creator_id: userData.creator_id
                        })
                    });

                    if (!storeResponse.ok) {
                        const errorData = await storeResponse.json();
                        console.error('Store subscriber error:', errorData);
                        throw new Error('Failed to store subscriber: ' + JSON.stringify(errorData));
                    }

                    const data = await storeResponse.json();
                    console.log('Store response:', data);
                    
                    return NextResponse.json({ 
                        message: 'Subscription activated successfully',
                        data: data
                    }, { status: 200 });
                } catch (error) {
                    console.error('Subscription error:', error);
                    return NextResponse.json({ error: error.message }, { status: 500 });
                }
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