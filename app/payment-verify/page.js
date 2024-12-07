'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentVerifyPage() {
    const [status, setStatus] = useState('initializing');
    const [message, setMessage] = useState('');
    const searchParams = useSearchParams();
    const trackingId = searchParams.get('trackingId');
    const txRef = searchParams.get('tx_ref'); // Chapa adds this

    useEffect(() => {
        const initVerification = async () => {
            try {
                // Get the payment details from tracking
                const response = await fetch(`/api/pay/track?trackingId=${trackingId}`);
                if (!response.ok) {
                    throw new Error('Failed to get payment details');
                }

                const data = await response.json();
                console.log('Payment tracking data:', JSON.stringify(data, null, 2));

                if (data.chapaUrl) {
                    // Store that we're redirecting to Chapa
                    await fetch('/api/pay/track', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            event: 'redirecting_to_chapa',
                            trackingId,
                            data: { url: data.chapaUrl }
                        })
                    });

                    // If we have a transaction reference, check its status
                    if (txRef) {
                        const statusResponse = await fetch(`/api/chapa-status?txRef=${txRef}&trackingId=${trackingId}`);
                        const statusData = await statusResponse.json();
                        
                        console.log('Transaction status:', JSON.stringify(statusData, null, 2));
                        
                        if (statusData.status === 2) {
                            setStatus('failed');
                            setMessage(statusData.message || 'Payment failed');
                            return;
                        }
                    }

                    // Redirect to Chapa in the same window
                    window.location.href = data.chapaUrl;
                }

            } catch (error) {
                console.error('Payment verification error:', error);
                setStatus('error');
                setMessage(error.message);
                
                // Track the error
                await fetch('/api/pay/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event: 'error',
                        trackingId,
                        data: { error: error.message }
                    })
                });
            }
        };

        if (trackingId) {
            initVerification();
        }
    }, [trackingId, txRef]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">
                    {status === 'initializing' && 'Processing Payment...'}
                    {status === 'failed' && 'Payment Failed'}
                    {status === 'error' && 'Payment Error'}
                </h1>
                {(status === 'failed' || status === 'error') && message && (
                    <p className="text-red-500">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
