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

                    // Open Chapa in a new window
                    const paymentWindow = window.open(data.chapaUrl, 'payment_window', 'width=800,height=600');
                    
                    // Function to check if URL contains success/failure parameters
                    const checkPaymentStatus = async (url) => {
                        console.log('Checking URL:', url);
                        if (url.includes('ye-buna.com/success')) {
                            // This means payment was successful
                            await fetch('/api/pay/track', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    event: 'payment_status',
                                    trackingId,
                                    status: 1,
                                    data: { url, message: 'Payment successful - redirected to ye-buna success page' }
                                })
                            });
                            setStatus('success');
                            return true;
                        } else if (url.includes('status=success') || url.includes('status=1')) {
                            await fetch('/api/pay/track', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    event: 'payment_status',
                                    trackingId,
                                    status: 1,
                                    data: { url }
                                })
                            });
                            setStatus('success');
                            return true;
                        } else if (url.includes('status=failed') || url.includes('status=0') || url.includes('status=cancel')) {
                            await fetch('/api/pay/track', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    event: 'payment_status',
                                    trackingId,
                                    status: 0,
                                    data: { url }
                                })
                            });
                            setStatus('failed');
                            return true;
                        }
                        return false;
                    };

                    // Check if popup is still open and its URL
                    const checkInterval = setInterval(async () => {
                        if (!paymentWindow || paymentWindow.closed) {
                            console.log('Payment window closed');
                            clearInterval(checkInterval);
                            
                            // Final check of our tracking data
                            const finalCheck = await fetch(`/api/pay/track?trackingId=${trackingId}`);
                            const finalData = await finalCheck.json();
                            
                            if (finalData.status === 'success') {
                                setStatus('success');
                            } else if (finalData.status === 'failed') {
                                setStatus('failed');
                            } else {
                                // If window was closed without a status, mark as failed
                                await fetch('/api/pay/track', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        event: 'payment_status',
                                        trackingId,
                                        status: 0,
                                        data: { reason: 'Window closed without completion' }
                                    })
                                });
                                setStatus('failed');
                            }
                            return;
                        }

                        try {
                            // Try to check the popup's URL
                            const popupUrl = paymentWindow.location.href;
                            console.log('Checking popup URL:', popupUrl);
                            
                            // If we can access the URL and it's not about:blank
                            if (popupUrl && popupUrl !== 'about:blank') {
                                if (await checkPaymentStatus(popupUrl)) {
                                    console.log('Payment status detected, closing window...');
                                    clearInterval(checkInterval);
                                    setTimeout(() => {
                                        paymentWindow.close();
                                    }, 500); // Give a small delay before closing
                                }
                            }
                        } catch (e) {
                            // If we can't access the URL due to CORS, that's okay
                            console.log('Could not access popup URL (expected due to CORS)');
                        }
                    }, 500); // Check every 500ms instead of 1000ms

                    // Clean up interval when component unmounts
                    return () => clearInterval(checkInterval);
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
