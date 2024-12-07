import { NextResponse } from 'next/server';

// Initialize global tracking map if it doesn't exist
if (!global.paymentTracking) {
    global.paymentTracking = new Map();
}

export async function POST(request) {
    try {
        const data = await request.json();
        const { event, trackingId, data: paymentData } = data;
        
        // Log the full incoming data for debugging
        console.log('Payment tracking - Raw data:', JSON.stringify(data, null, 2));
        
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
        
        // Add new event with full data
        const eventData = {
            event,
            timestamp: Date.now(),
            data: paymentData
        };

        // Update status based on event type
        if (event === 'chapa_callback') {
            tracking.status = paymentData?.status || 'pending';
            eventData.chapaStatus = paymentData?.status;
            console.log('Chapa callback status:', tracking.status);
        } else if (event === 'error') {
            tracking.status = 'error';
            console.log('Payment error:', paymentData?.error);
        }
        
        tracking.events.push(eventData);
        tracking.lastUpdate = Date.now();
        
        global.paymentTracking.set(trackingId, tracking);
        
        // Log the full updated tracking data
        console.log('Updated tracking:', JSON.stringify(tracking, null, 2));
        
        return NextResponse.json({
            trackingId,
            status: tracking.status,
            lastUpdate: tracking.lastUpdate,
            lastEvent: eventData
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
