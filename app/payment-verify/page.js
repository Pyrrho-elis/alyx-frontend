'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentVerifyPage() {
    const searchParams = useSearchParams();
    const tx_ref = searchParams.get('tx_ref');
    const status = searchParams.get('status');

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                if (!tx_ref) {
                    throw new Error('Payment reference not found');
                }

                if (status === 'success') {
                    // Create subscription
                    const response = await fetch('/api/verify-payment-token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            token: tx_ref,
                            action: 'subscribe',
                            response: { status: 1 }
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to verify payment');
                    }

                    // Redirect to success page or creator's page
                    window.location.href = '/payment-success';
                } else {
                    // Payment failed
                    window.location.href = '/payment-failed';
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                window.location.href = '/payment-failed';
            }
        };

        verifyPayment();
    }, [tx_ref, status]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Verifying Payment...</h1>
                <p>Please wait while we verify your payment.</p>
            </div>
        </div>
    );
}
