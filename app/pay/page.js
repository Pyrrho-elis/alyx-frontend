'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PayPage() {
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('loading');
    const [userData, setUserData] = useState(null);
    const [paymentPageContent, setPaymentPageContent] = useState('');
    const iframeRef = useRef(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        const checkSubscription = async () => {
            if (!token) {
                setError('No payment token provided');
                setStatus('error');
                return;
            }

            try {
                const verifyResponse = await fetch('/api/verify-payment-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, action: 'verify' })
                });

                if (!verifyResponse.ok) {
                    throw new Error('Invalid token');
                }

                const { data: tokenData } = await verifyResponse.json();
                console.log('Token verification response:', tokenData);
                setUserData(tokenData);

                if (tokenData.has_active_subscription) {
                    console.log('User already has active subscription:', tokenData.subscription);
                    router.push(`/creator/${tokenData.creator_id}?status=already_subscribed`);
                    return;
                }

                handleTip(token);
            } catch (error) {
                console.error('Error checking subscription:', error);
                setError('Failed to verify subscription status');
                setStatus('error');
            }
        };

        checkSubscription();
    }, [token, router]);

    const handleTip = async (token) => {
        try {
            const response = await fetch('/api/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token })
            });

            if (!response.ok) {
                throw new Error('Failed to initiate payment');
            }

            const data = await response.text();
            setPaymentPageContent(data);
            setStatus('ready');
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
            setStatus('error');
        }
    };

    useEffect(() => {
        const preventDevTools = (e) => {
            if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && e.keyCode === 73)) {
                e.preventDefault();
            }
        };

        const preventContextMenu = (e) => {
            e.preventDefault();
        };

        document.addEventListener('keydown', preventDevTools);
        document.addEventListener('contextmenu', preventContextMenu);

        return () => {
            document.removeEventListener('keydown', preventDevTools);
            document.removeEventListener('contextmenu', preventContextMenu);
        };
    }, []);

    useEffect(() => {
        if (paymentPageContent && iframeRef.current) {
            const iframe = iframeRef.current;
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            // Inject the content and scripts
            iframeDoc.open();
            iframeDoc.write(paymentPageContent);
            
            // Inject XHR and fetch interceptors
            const script = iframeDoc.createElement('script');
            script.textContent = `
                (function() {
                    const originalXHR = window.XMLHttpRequest;
                    window.XMLHttpRequest = function() {
                        const xhr = new originalXHR();
                        const originalSend = xhr.send;
                        const originalOpen = xhr.open;

                        xhr.open = function() {
                            console.log('XHR Request:', ...arguments);
                            return originalOpen.apply(this, arguments);
                        };

                        xhr.send = function() {
                            console.log('XHR Payload:', ...arguments);
                            
                            xhr.addEventListener('load', function() {
                                console.log('XHR Response:', {
                                    status: xhr.status,
                                    response: xhr.response
                                });
                                
                                try {
                                    const response = JSON.parse(xhr.response);
                                    if (response.status === 1) {
                                        window.parent.postMessage({
                                            type: 'paymentSuccess',
                                            data: response
                                        }, '*');
                                    }
                                } catch (e) {
                                    // Not JSON, ignore
                                }
                            });
                            
                            return originalSend.apply(this, arguments);
                        };
                        
                        return xhr;
                    };

                    const originalFetch = window.fetch;
                    window.fetch = function() {
                        console.log('Fetch Request:', ...arguments);
                        return originalFetch.apply(this, arguments)
                            .then(async response => {
                                const clone = response.clone();
                                try {
                                    const data = await clone.json();
                                    console.log('Fetch Response:', data);
                                    if (data.status === 1) {
                                        window.parent.postMessage({
                                            type: 'paymentSuccess',
                                            data: data
                                        }, '*');
                                    }
                                } catch (e) {
                                    // Not JSON, ignore
                                }
                                return response;
                            });
                    };
                })();
            `;
            iframeDoc.head.appendChild(script);
            iframeDoc.close();
        }
    }, [paymentPageContent]);

    useEffect(() => {
        const handleMessage = async (event) => {
            console.log('Received message:', event.data);
            
            if (event.data.type === 'paymentSuccess') {
                try {
                    console.log('Payment successful, verifying with token data:', userData);
                    const verifyResponse = await fetch('/api/verify-payment-token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            token,
                            action: 'subscribe',
                            response: event.data.data
                        })
                    });

                    if (!verifyResponse.ok) {
                        throw new Error('Failed to verify payment');
                    }

                    const data = await verifyResponse.json();
                    console.log('Verification response:', data);

                    if (data.message === 'Subscription activated successfully') {
                        setStatus('success');
                        router.push(`/creator/${userData.creator_id}?status=subscription_active`);
                    }
                } catch (error) {
                    console.error('Error handling payment success:', error);
                    setError('Failed to process payment. Please contact support.');
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [token, userData, router]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <div className="text-red-600 text-center mb-4">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <h2 className="text-xl font-bold mb-2">Error</h2>
                        <p>{error}</p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Processing payment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto py-8 px-4">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Complete Your Subscription</h1>
                        <div className="relative" style={{ height: '600px' }}>
                            <iframe
                                ref={iframeRef}
                                className="absolute inset-0 w-full h-full"
                                frameBorder="0"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
