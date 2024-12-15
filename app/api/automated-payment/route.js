import { NextResponse } from 'next/server';
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req) {
    try {
        // Get request body
        const { phone_number, user_id, creator_id, token } = await req.json();

        // Validate inputs
        if (!phone_number || !user_id || !creator_id || !token) {
            return NextResponse.json({
                error: 'Missing required fields'
            }, { status: 400 });
        }

        // Validate phone number format (Ethiopian format)
        if (!/^09[0-9]{8}$/.test(phone_number)) {
            return NextResponse.json({
                error: 'Invalid phone number format'
            }, { status: 400 });
        }

        // Call external payment API
        const paymentResponse = await fetch(`${process.env.PAYMENT_API}/api/pay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phone_number,
                user_id,
                creator_id,
                token
            })
        });

        if (!paymentResponse.ok) {
            const errorData = await paymentResponse.json();
            return NextResponse.json({
                error: errorData.error || 'Payment process failed'
            }, { status: paymentResponse.status });
        }

        const paymentData = await paymentResponse.json();

        // If payment successful, call store-subscriber
        if (paymentData.success) {
            const storeResponse = await fetch(`${req.headers.get('origin')}/api/store-subscriber`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id,
                    creator_id
                })
            });

            if (!storeResponse.ok) {
                const storeError = await storeResponse.json();
                return NextResponse.json({
                    error: 'Payment successful but failed to create subscription',
                    details: storeError.error
                }, { status: 500 });
            }

            const storeData = await storeResponse.json();
            return NextResponse.json({
                success: true,
                message: 'Payment successful and subscription created',
                subscription: storeData
            });
        }

        return NextResponse.json({
            error: 'Payment process failed'
        }, { status: 400 });

    } catch (error) {
        console.error('Automated payment error:', error);
        return NextResponse.json({
            error: 'Payment automation failed',
            details: error.message
        }, { status: 500 });
    }
}
