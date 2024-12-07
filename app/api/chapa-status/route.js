import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const txRef = searchParams.get('txRef');
        const trackingId = searchParams.get('trackingId');

        if (!txRef) {
            return NextResponse.json({ error: 'Transaction reference required' }, { status: 400 });
        }

        // Call Chapa's status endpoint
        const response = await fetch(`https://checkout.chapa.co/checkout/ajax-transaction-status/${txRef}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.6668.71 Safari/537.36',
                'Accept': 'application/json',
                'Origin': 'https://checkout.chapa.co',
                'Referer': 'https://checkout.chapa.co/'
            }
        });

        const data = await response.json();
        console.log('Chapa transaction status:', JSON.stringify(data, null, 2));

        // Track this status check if we have a tracking ID
        if (trackingId) {
            await fetch(`${request.headers.get('origin')}/api/pay/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'chapa_status_check',
                    trackingId,
                    data: {
                        txRef,
                        ...data
                    }
                })
            });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error checking Chapa status:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
