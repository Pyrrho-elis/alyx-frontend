'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PayTest() {
    const router = useRouter();
    const [userData, setUserData] = useState("loading");
    const [error, setError] = useState(null)
    const [status, setStatus] = useState(null);
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const iframeRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [paymentPageContent, setPaymentPageContent] = useState('');

    // Add subscription check effect
    useEffect(() => {
        const checkSubscription = async () => {
            if (!token) return;

            try {
                // First verify the token
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

                // If no active subscription, proceed with payment
                handleTip(token);
            } catch (error) {
                console.error('Error checking subscription:', error);
                setError('Failed to verify subscription status');
            }
        };

        checkSubscription();
    }, [token]);

    const handleTip = async (token) => {
        setLoading(true);

        try {
            const payResponse = await fetch('/api/pay', {
                method: 'POST',
                body: JSON.stringify({ token })
            });

            if (payResponse.ok) {
                const { redirectUrl } = await payResponse.json();
                console.log('Redirect URL:', redirectUrl);
                const proxyUrl = `/api/proxy?url=${encodeURIComponent(redirectUrl)}`;

                const proxyResponse = await fetch(proxyUrl);
                if (proxyResponse.ok) {
                    const content = await proxyResponse.text();
                    setPaymentPageContent(content);
                } else {
                    console.error('Proxy response not OK:', proxyResponse.status);
                }
            } else {
                console.error('Pay response not OK:', payResponse);
            }
        } catch (error) {
            console.error('Error during payment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStoreSubscriber = async () => {
        const storeResponse = fetch('/api/store-subscriber', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id,
                creator_id
            })
        });
        if (!storeResponse.ok) {
            throw new Error('Failed to store subscriber');
        }
        const data = await storeResponse.json();
        return data;
    }

    const handlePaymentResponse = async (response) => {
        const res = await fetch('/api/verify-payment-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ response: response, token, action: 'subscribe' })
        });
        if (res.ok) {
            const data = await res.json();
            setStatus(data.message);
            console.log('Data:', data);
        }
    };

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
                        // Store subscriber using the correct user_id from userData
                        console.log('Storing subscriber with data:', {
                            user_id: userData.user_id,
                            creator_id: userData.creator_id
                        });
                        
                        const storeResponse = await fetch('/api/store-subscriber', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                user_id: userData.user_id,
                                creator_id: userData.creator_id
                            })
                        });

                        if (!storeResponse.ok) {
                            const errorData = await storeResponse.json();
                            console.error('Store subscriber error:', errorData);
                            throw new Error('Failed to store subscriber: ' + JSON.stringify(errorData));
                        }

                        const storeData = await storeResponse.json();
                        console.log('Store response:', storeData);

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
    }, [token, userData]); // Added userData to dependencies

    useEffect(() => {
        const preventDevTools = () => {
            // Temporarily disabled for testing
            return;
        };

        const preventKeyShortcuts = (e) => {
            // Temporarily disabled for testing
            return;
        };

        // Temporarily disabled for testing
        // document.addEventListener('contextmenu', (e) => e.preventDefault());
        // document.addEventListener('keydown', preventKeyShortcuts);

        return () => {
            // document.removeEventListener('contextmenu', (e) => e.preventDefault());
            // document.removeEventListener('keydown', preventKeyShortcuts);
        };
    }, []);

    useEffect(() => {
        const getPaymentPage = async () => {
            try {
                const response = await fetch('/api/pay');
                if (!response.ok) throw new Error('Failed to fetch payment page');
                const data = await response.text();
                setPaymentPageContent(data);
            } catch (error) {
                console.error('Error fetching payment page:', error);
            }
        };

        getPaymentPage();
    }, []);

    useEffect(() => {
        const handleTokenVerification = async () => {
            if (token) {
                try {
                    console.log('Verifying token...');
                    const response = await fetch(`/api/verify-payment-token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token, action: 'verify' })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.error) {
                            setError(data.error);
                        } else {
                            setUserData(token);
                        }
                    } else {
                        setError(response.statusText);
                    }
                } catch (error) {
                    setError(error.message);
                }
            }
        };
        handleTokenVerification();
    }, [token]);

    useEffect(() => {
        if (userData === token && paymentPageContent === "") {
            console.log(token)
            handleTip(token);
        }
    }, [userData, token, paymentPageContent]);

    useEffect(() => {
        if (paymentPageContent && iframeRef.current) {
            const iframe = iframeRef.current;
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            const script = iframeDoc.createElement('script');
            script.textContent = `
                (function() {
                    const originalFetch = window.fetch;
                    window.fetch = function(url, options) {
                        const proxyUrl = '/api/proxy?url=' + encodeURIComponent(url);
                        return originalFetch(proxyUrl, options).then(response => {
                            const originalJson = response.json;
                            response.json = function() {
                                return originalJson.call(this).then(data => {
                                    window.parent.postMessage({type: 'paymentResponse', data: data}, '*');
                                    return data;
                                });
                            };
                            return response;
                        });
                    };

                    const originalXHR = window.XMLHttpRequest;
                    window.XMLHttpRequest = function() {
                        const xhr = new originalXHR();
                        const originalOpen = xhr.open;
                        xhr.open = function(method, url, ...rest) {
                            const proxyUrl = '/api/proxy?url=' + encodeURIComponent(url);
                            return originalOpen.call(this, method, proxyUrl, ...rest);
                        };
                        const originalSetRequestHeader = xhr.setRequestHeader;
                        xhr.setRequestHeader = function(header, value) {
                            if (header.toLowerCase() === 'x-requested-with') return;
                            originalSetRequestHeader.call(this, header, value);
                        };
                        const originalSend = xhr.send;
                        xhr.send = function(...args) {
                            this.addEventListener('load', function() {
                                if (this.responseType === '' || this.responseType === 'text') {
                                    try {
                                        const data = JSON.parse(this.responseText);
                                        window.parent.postMessage({type: 'paymentResponse', data: data}, '*');
                                    } catch (e) {
                                        // Not JSON, ignore
                                    }
                                }
                            });
                            
                            return originalSend.apply(this, args);
                        };
                        
                        return xhr;
                    };
                })();
            `;
            iframeDoc.head.appendChild(script);

            iframeDoc.open();
            iframeDoc.write(paymentPageContent);
            iframeDoc.close();

            const messageHandler = (event) => {
                if (event.data.type === 'paymentResponse') {
                    handlePaymentResponse(event.data.data);
                }
            };

            window.addEventListener('message', messageHandler);

            return () => {
                window.removeEventListener('message', messageHandler);
            };
        }
    }, [paymentPageContent]);

    return (
        <div className="container mx-auto p-4">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            {status === 'pending_payment' && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Payment Pending!</strong>
                    <span className="block sm:inline"> You already have a pending payment request. Please complete your payment to access the content.</span>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <>
                    {paymentPageContent && (
                        <div className="relative w-full h-[600px]">
                            <iframe
                                ref={iframeRef}
                                className="w-full h-full"
                                sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-top-navigation"
                                srcDoc={`
                                    <!DOCTYPE html>
                                    <html>
                                        <head>
                                            <meta charset="utf-8">
                                            <script>
                                                // Intercept all XHR requests
                                                (function() {
                                                    const originalXHR = window.XMLHttpRequest;
                                                    function ProxyXHR() {
                                                        const xhr = new originalXHR();
                                                        const originalOpen = xhr.open;
                                                        const originalSend = xhr.send;
                                                        
                                                        xhr.open = function() {
                                                            const [method, url, ...rest] = arguments;
                                                            console.log('Intercepted XHR:', method, url);
                                                            
                                                            // Proxy the request through our proxy endpoint
                                                            const proxyUrl = '/api/proxy?url=' + encodeURIComponent(url);
                                                            arguments[1] = proxyUrl;
                                                            
                                                            return originalOpen.apply(xhr, arguments);
                                                        };

                                                        xhr.send = function(...args) {
                                                            xhr.addEventListener('load', function() {
                                                                if (xhr.responseType === '' || xhr.responseType === 'text') {
                                                                    try {
                                                                        const response = JSON.parse(xhr.responseText);
                                                                        console.log('Payment response:', response);
                                                                        
                                                                        // Check for successful payment
                                                                        if (response.status === 1 || response.status === "1") {
                                                                            window.parent.postMessage({
                                                                                type: 'paymentSuccess',
                                                                                data: response
                                                                            }, '*');
                                                                        }
                                                                    } catch (e) {
                                                                        // Not JSON or parsing error
                                                                        console.log('Response is not JSON:', xhr.responseText);
                                                                    }
                                                                }
                                                            });
                                                            
                                                            return originalSend.apply(xhr, args);
                                                        };
                                                        
                                                        return xhr;
                                                    }
                                                    
                                                    window.XMLHttpRequest = ProxyXHR;
                                                    
                                                    // Also intercept fetch requests
                                                    const originalFetch = window.fetch;
                                                    window.fetch = function(url, options = {}) {
                                                        console.log('Intercepted fetch:', url);
                                                        const proxyUrl = '/api/proxy?url=' + encodeURIComponent(url);
                                                        return originalFetch(proxyUrl, options).then(async response => {
                                                            const clonedResponse = response.clone();
                                                            try {
                                                                const data = await clonedResponse.json();
                                                                console.log('Payment response:', data);
                                                                
                                                                // Check for successful payment
                                                                if (data.status === 1 || data.status === "1") {
                                                                    window.parent.postMessage({
                                                                        type: 'paymentSuccess',
                                                                        data: data
                                                                    }, '*');
                                                                }
                                                            } catch (e) {
                                                                // Not JSON or parsing error
                                                                console.log('Response is not JSON');
                                                            }
                                                            return response;
                                                        });
                                                    };

                                                    // Log all postMessage events
                                                    window.addEventListener('message', function(event) {
                                                        console.log('Received message in iframe:', event.data);
                                                    });
                                                })();
                                            </script>
                                            ${paymentPageContent}
                                        </head>
                                        <body>
                                            <div id="payment-container"></div>
                                        </body>
                                    </html>
                                `}
                                onLoad={() => {
                                    console.log('Payment iframe loaded');
                                }}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}