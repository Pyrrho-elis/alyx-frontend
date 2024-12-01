import { NextResponse } from 'next/server';

// Initialize global tracking map if it doesn't exist
if (!global.paymentTracking) {
    global.paymentTracking = new Map();
}

export async function POST(request) {
    try {
        const data = await request.json();
        const { event, status, trackingId, data: paymentData } = data;
        
        console.log('Payment tracking event:', { event, status, trackingId, paymentData });
        
        // Get tracking entry
        let tracking = global.paymentTracking.get(trackingId);
        if (!tracking) {
            tracking = {
                trackingId,
                status: 'pending',
                events: [],
                lastUpdate: Date.now()
            };
        }
        
        // Add new event
        tracking.events.push({
            event,
            status,
            data: paymentData,
            timestamp: Date.now()
        });
        
        // Update status based on payment response
        if (event === 'payment_status') {
            if (status === 1 || status === '1') {
                tracking.status = 'success';
            } else if (status === 0 || status === '0') {
                tracking.status = 'failed';
            }
        }
        
        tracking.lastUpdate = Date.now();
        global.paymentTracking.set(trackingId, tracking);
        
        console.log('Updated tracking:', tracking);
        
        return NextResponse.json({
            trackingId,
            status: tracking.status,
            lastUpdate: tracking.lastUpdate
        });
    } catch (error) {
        console.error('Error tracking payment:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const trackingId = searchParams.get('trackingId');
        
        if (!trackingId) {
            return NextResponse.json({ error: 'Tracking ID required' }, { status: 400 });
        }
        
        const tracking = global.paymentTracking.get(trackingId);
        
        if (!tracking) {
            return NextResponse.json({ error: 'Tracking not found' }, { status: 404 });
        }
        
        return NextResponse.json(tracking);
    } catch (error) {
        console.error('Error getting tracking:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
