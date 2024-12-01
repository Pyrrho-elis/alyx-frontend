'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentVerifyPage() {
    const [status, setStatus] = useState('initializing');
    const searchParams = useSearchParams();
    const trackingId = searchParams.get('trackingId');

    useEffect(() => {
        const initVerification = async () => {
            try {
                // Get the payment details from tracking
                const response = await fetch(`/api/pay/track?trackingId=${trackingId}`);
                if (!response.ok) {
                    throw new Error('Failed to get payment details');
                }

                const data = await response.json();
                console.log('Payment tracking data:', data);

                if (data.chapaUrl) {
                    // Store that we're redirecting to Chapa
                    await fetch('/api/pay/track', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            event: 'redirecting_to_chapa',
                            trackingId,
                            status: 'pending'
                        })
                    });

                    // Set up tracking for when user returns
                    const channel = new BroadcastChannel('payment_status');
                    
                    // Open Chapa in a new window
                    const paymentWindow = window.open(data.chapaUrl, 'payment_window', 'width=800,height=600');
                    
                    // Check payment status periodically
                    const checkInterval = setInterval(async () => {
                        try {
                            const statusResponse = await fetch(`/api/pay/track?trackingId=${trackingId}`);
                            const statusData = await statusResponse.json();
                            
                            if (statusData.status === 'success') {
                                clearInterval(checkInterval);
                                setStatus('success');
                                if (paymentWindow) {
                                    paymentWindow.close();
                                }
                            } else if (statusData.status === 'failed') {
                                clearInterval(checkInterval);
                                setStatus('failed');
                                if (paymentWindow) {
                                    paymentWindow.close();
                                }
                            }
                        } catch (error) {
                            console.error('Error checking payment status:', error);
                        }
                    }, 2000); // Check every 2 seconds

                    // Clean up interval when component unmounts
                    return () => {
                        clearInterval(checkInterval);
                        channel.close();
                    };
                }
            } catch (error) {
                console.error('Verification error:', error);
                setStatus('error');
            }
        };

        if (trackingId) {
            initVerification();
        }
    }, [trackingId]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                        Payment Verification
                    </h2>
                    {status === 'initializing' && (
                        <>
                            <p className="text-lg text-gray-600 mb-4">
                                Initializing payment verification...
                            </p>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        </>
                    )}
                    {status === 'success' && (
                        <div className="text-green-600">
                            <p className="text-lg font-semibold">Payment Successful!</p>
                            <p className="mt-2">Your payment has been processed successfully.</p>
                        </div>
                    )}
                    {status === 'failed' && (
                        <div className="text-red-600">
                            <p className="text-lg font-semibold">Payment Failed</p>
                            <p className="mt-2">There was an issue processing your payment.</p>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="text-red-600">
                            <p className="text-lg font-semibold">Verification Error</p>
                            <p className="mt-2">Unable to verify payment status.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
