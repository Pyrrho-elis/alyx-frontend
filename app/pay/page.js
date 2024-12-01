'use client';

import { useState, useEffect } from 'react';

export default function PayPage() {
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState(null);

    useEffect(() => {
        const initPayment = async () => {
            try {
                const response = await fetch('/api/pay', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to initiate payment');
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

        initPayment();
    }, []);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-4">Initializing Payment...</h2>
                    <p>Please wait while we redirect you to the payment page.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center text-red-600">
                    <h2 className="text-xl font-semibold mb-4">Payment Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return null;
}
