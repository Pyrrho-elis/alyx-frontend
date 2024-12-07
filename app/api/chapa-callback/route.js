import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        // Get all data from Chapa's callback
        const data = await req.json();
        
        // Log the full callback data
        console.log('Chapa callback - Raw data:', JSON.stringify(data, null, 2));

        // Extract tracking ID from the customization object if it exists
        const trackingId = data?.customization?.tracking_id;
        
        if (trackingId) {
            console.log('Processing Chapa callback for tracking ID:', trackingId);
            
            // Log this callback in our tracking system
            const trackResponse = await fetch(`${req.headers.get('origin')}/api/pay/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'chapa_callback',
                    trackingId,
                    data: data // Store all data from Chapa
                })
            });

            const trackResult = await trackResponse.json();
            console.log('Tracking result:', JSON.stringify(trackResult, null, 2));

            // If this is a successful payment and we have the token, create subscription
            if (data.status === 'success') {
                console.log('Payment successful, fetching tracking data...');
                
                // Get tracking data to get token
                const response = await fetch(`${req.headers.get('origin')}/api/pay/track?trackingId=${trackingId}`);
                const trackingData = await response.json();
                
                if (trackingData.token) {
                    console.log('Creating subscription for successful payment...');
                    
                    // Create subscription
                    const subscribeResponse = await fetch(`${req.headers.get('origin')}/api/verify-payment-token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            token: trackingData.token,
                            action: 'subscribe',
                            response: { status: 1 }
                        })
                    });

                    const subscribeResult = await subscribeResponse.json();
                    console.log('Subscription result:', JSON.stringify(subscribeResult, null, 2));
                } else {
                    console.log('No token found in tracking data:', JSON.stringify(trackingData, null, 2));
                }
            } else {
                console.log('Payment not successful. Status:', data.status);
            }
        } else {
            console.log('No tracking ID found in callback data');
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
