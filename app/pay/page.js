'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PayPage() {
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState(null);
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        const initPayment = async () => {
            try {
                if (!token) {
                    throw new Error('Payment token is required');
                }

                console.log('Verifying token:', token);

                // First verify the token and check subscription
                const verifyResponse = await fetch('/api/verify-payment-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token,
                        action: 'verify'
                    })
                });

                if (!verifyResponse.ok) {
                    const errorData = await verifyResponse.json();
                    throw new Error(errorData.error || 'Invalid payment token');
                }

                const verifyData = await verifyResponse.json();
                
                // Check if user already has active subscription
                if (verifyData.data.has_active_subscription) {
                    throw new Error('You already have an active subscription');
                }

                // If verification passed, initiate payment
                const response = await fetch('/api/pay', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to initiate payment');
                }

                const data = await response.json();
                if (data.redirectUrl) {
                    window.location.href = data.redirectUrl;
                } else {
                    throw new Error('No redirect URL received');
                }
            } catch (error) {
                console.error('Payment error:', error);
                setError(error.message);
                setStatus('error');
            }
        };

        if (token) {
            initPayment();
        } else {
            setError('Payment token is required');
            setStatus('error');
        }
    }, [token]);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen w-full">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-4">Initializing Payment...</h2>
                    <p>Please wait while we verify your payment token.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen w-full">
                <div className="text-center text-red-600">
                    <h2 className="text-xl font-semibold mb-4">Payment Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return null;
}
