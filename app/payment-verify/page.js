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
                    let lastUrl = '';

                    // Function to check payment status from URL
                    const checkPaymentStatus = async (url) => {
                        // Don't process the same URL twice
                        if (url === lastUrl) return false;
                        lastUrl = url;
                        
                        console.log('New URL detected:', url);
                        
                        // Track all redirects
                        await fetch('/api/pay/track', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                event: 'url_change',
                                trackingId,
                                status: 'pending',
                                data: { url }
                            })
                        });

                        // Check for success patterns
                        if (url.includes('/success/success_tip') || url.includes('/success?') || url.includes('/success/')) {
                            console.log('Success URL detected:', url);
                            await fetch('/api/pay/track', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    event: 'payment_status',
                                    trackingId,
                                    status: 1,
                                    data: { url, message: 'Payment successful - success URL detected' }
                                })
                            });
                            setStatus('success');
                            return true;
                        }

                        /* Keeping verification URL check commented out since we don't need it
                        // Check for verification URL
                        if (url.includes('/verification?txRef=')) {
                            console.log('Verification URL detected:', url);
                            // Wait a bit to see if it redirects to success
                            return new Promise(resolve => {
                                setTimeout(async () => {
                                    try {
                                        const currentUrl = paymentWindow.location.href;
                                        if (currentUrl.includes('/success/')) {
                                            await checkPaymentStatus(currentUrl);
                                            resolve(true);
                                        } else {
                                            resolve(false);
                                        }
                                    } catch (e) {
                                        resolve(false);
                                    }
                                }, 2000);
                            });
                        }
                        */

                        return false;
                    };

                    // Check window status and URL
                    const checkInterval = setInterval(async () => {
                        if (!paymentWindow || paymentWindow.closed) {
                            console.log('Payment window closed');
                            clearInterval(checkInterval);
                            
                            // Final check of tracking data
                            const finalCheck = await fetch(`/api/pay/track?trackingId=${trackingId}`);
                            const finalData = await finalCheck.json();
                            
                            if (finalData.status === 'success') {
                                setStatus('success');
                            } else {
                                setStatus('failed');
                            }
                            return;
                        }

                        try {
                            const popupUrl = paymentWindow.location.href;
                            if (popupUrl && popupUrl !== 'about:blank') {
                                if (await checkPaymentStatus(popupUrl)) {
                                    console.log('Success detected, closing window...');
                                    clearInterval(checkInterval);
                                    setTimeout(() => {
                                        paymentWindow.close();
                                    }, 1000);
                                }
                            }
                        } catch (e) {
                            // CORS error, ignore
                        }
                    }, 500);

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 w-full">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                        Payment Verification
                    </h2>
                    {status === 'initializing' && (
                        <>
                            <p className="text-lg text-gray-600 mb-4">
                                Processing your payment...
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
