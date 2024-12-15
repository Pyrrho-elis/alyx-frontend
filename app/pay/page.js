'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PayPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        const initPayment = async () => {
            try {
                if (!token) {
                    throw new Error('Payment token is required');
                }

                // Initiate payment
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
                    // Store token for later verification
                    localStorage.setItem('payment_token', token);

                    // Redirect to payment page
                    window.location.href = data.redirectUrl;
                } else {
                    throw new Error('No redirect URL received');
                }
            } catch (error) {
                console.error('Payment error:', error);
                localStorage.removeItem('payment_token');
                window.location.href = '/payment-failed';
            }
        };

        if (token) {
            initPayment();
        } else {
            window.location.href = '/payment-failed';
        }
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">Initializing Payment...</h2>
                <p>Please wait while we prepare your payment.</p>
            </div>
        </div>
    );
}
