import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        // Get all data from Chapa's callback
        const data = await req.json();
        
        // Log the full callback data
        console.log('Chapa callback - Raw data:', JSON.stringify(data, null, 2));

        // If this is a successful payment, create subscription
        if (data.status === 'success') {
            console.log('Payment successful, creating subscription...');
            
            // Create subscription
            const subscribeResponse = await fetch(`${req.headers.get('origin')}/api/verify-payment-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: data.tx_ref, // Use tx_ref directly
                    action: 'subscribe',
                    response: { status: 1 }
                })
            });

            const subscribeResult = await subscribeResponse.json();
            console.log('Subscription result:', JSON.stringify(subscribeResult, null, 2));
        } else {
            console.log('Payment not successful. Status:', data.status);
        }

        // Always return success to Chapa
        return NextResponse.json({ status: 'received' });
    } catch (error) {
        console.error('Error processing Chapa callback:', error);
        // Log the full error for debugging
        console.error('Full error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        // Still return success to Chapa to prevent retries
        return NextResponse.json({ status: 'received' });
    }
}
