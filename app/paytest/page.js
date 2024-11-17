'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '../utils/supabase/client';

export default function PaymentTest({ userId: propUserId, amount, currency = 'ETB' }) {
    const [error, setError] = useState(null);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentPageContent, setPaymentPageContent] = useState(null);
    const iframeRef = useRef(null);
    const [session, setSession] = useState(null);
    const [paymentState, setPaymentState] = useState({
        attempted: false,
        verifying: false,
        verified: false,
        id: null
    });

    useEffect(() => {
        const supabase = createClient();
        
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
        };
        
        getSession();
    }, []);

    const handlePaymentRequest = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const userId = session?.user?.id || propUserId;
            if (!userId) {
                throw new Error('User ID not found. Please ensure you are logged in.');
            }

            const response = await fetch('/api/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    amount,
                    currency
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to initialize payment');
            }

            const data = await response.json();
            setPaymentPageContent(data.html);
            setPaymentState(prev => ({ ...prev, id: data.payment_id }));
        } catch (error) {
            console.error('Payment request error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStoreSubscriber = async (paymentId) => {
        try {
            const userId = session?.user?.id || propUserId;
            
            if (!userId) {
                console.warn('No user ID available for subscription');
                setError('User ID not found. Please ensure you are logged in.');
                return;
            }

            // Only store if we have a payment ID
            if (!paymentId) {
                console.warn('No payment ID available');
                setError('Payment verification failed. Please try again.');
                return;
            }

            const response = await fetch('/api/store-subscriber', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    payment_id: paymentId,
                    payment_status: 'completed'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to store subscription');
            }

            const data = await response.json();
            console.log('Subscription stored:', data);
            setStatus('Payment and subscription completed successfully');
        } catch (error) {
            console.error('Error storing subscription:', error);
            setError('Payment completed but failed to store subscription. Please contact support.');
        }
    };

    const verifyPayment = async (token) => {
        try {
            if (paymentState.verifying || paymentState.verified) {
                return;
            }

            setPaymentState(prev => ({ ...prev, verifying: true }));

            const response = await fetch('/api/verify-payment-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token })
            });

            if (!response.ok) {
                throw new Error('Payment verification failed');
            }

            const data = await response.json();
            
            if (data.verified) {
                setPaymentState(prev => ({ 
                    ...prev, 
                    verified: true,
                    verifying: false 
                }));
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Payment verification error:', error);
            setPaymentState(prev => ({ ...prev, verifying: false }));
            throw error;
        }
    };

    // Effect for iframe content
    useEffect(() => {
        if (!paymentPageContent || !iframeRef.current) return;

        const iframe = iframeRef.current;
        
        try {
            console.log('Writing content to iframe...');
            
            // Create a blob URL from the HTML content
            const blob = new Blob([paymentPageContent], { type: 'text/html' });
            const blobUrl = URL.createObjectURL(blob);
            
            // Load the content using src
            iframe.src = blobUrl;
            
            // Wait for iframe to load before injecting script
            const handleLoad = () => {
                try {
                    console.log('Iframe loaded, injecting monitoring script...');
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    
                    if (!iframeDoc || !iframeDoc.body) {
                        console.error('Cannot access iframe document or body');
                        return;
                    }

                    // Add the monitoring script
                    const script = iframeDoc.createElement('script');
                    script.textContent = `
                        (function() {
                            let paymentAttempted = false;
                            let lastResponseTime = Date.now();
                            const paymentId = '${paymentState.id}';

                            console.log('Payment monitoring script initialized');
                            console.log('Payment ID:', paymentId);

                            // Function to safely get URL
                            function getProxyUrl(url) {
                                try {
                                    // Handle relative URLs
                                    if (url.startsWith('/')) {
                                        const baseUrl = window.location.origin;
                                        url = baseUrl + url;
                                    }
                                    return '/api/proxy?url=' + encodeURIComponent(url);
                                } catch (error) {
                                    console.error('Error creating proxy URL:', error);
                                    return url;
                                }
                            }

                            // Monitor network requests
                            const originalFetch = window.fetch;
                            window.fetch = function(url, options) {
                                try {
                                    console.log('Intercepted fetch request to:', url);
                                    const proxyUrl = getProxyUrl(url);
                                    lastResponseTime = Date.now();
                                    
                                    return originalFetch(proxyUrl, options)
                                        .then(response => {
                                            console.log('Fetch response received:', response.status);
                                            const originalJson = response.json;
                                            response.json = function() {
                                                return originalJson.call(this).then(data => {
                                                    console.log('Response data:', data);
                                                    lastResponseTime = Date.now();
                                                    if (data && (data.status === 'success' || data.status === 1)) {
                                                        paymentAttempted = true;
                                                        console.log('Payment success detected in response');
                                                        window.parent.postMessage({
                                                            type: 'paymentSuccess',
                                                            paymentId,
                                                            timestamp: Date.now()
                                                        }, '*');
                                                    }
                                                    return data;
                                                });
                                            };
                                            return response;
                                        })
                                        .catch(error => {
                                            console.error('Fetch error:', error);
                                            window.parent.postMessage({
                                                type: 'paymentError',
                                                error: error.message,
                                                paymentId
                                            }, '*');
                                            throw error;
                                        });
                                } catch (error) {
                                    console.error('Fetch wrapper error:', error);
                                    return originalFetch(url, options);
                                }
                            };

                            // Monitor XHR requests
                            const originalXHR = window.XMLHttpRequest;
                            window.XMLHttpRequest = function() {
                                const xhr = new originalXHR();
                                const originalOpen = xhr.open;
                                
                                xhr.open = function(method, url, ...rest) {
                                    try {
                                        console.log('Intercepted XHR request:', method, url);
                                        const proxyUrl = getProxyUrl(url);
                                        return originalOpen.call(this, method, proxyUrl, ...rest);
                                    } catch (error) {
                                        console.error('XHR open error:', error);
                                        return originalOpen.call(this, method, url, ...rest);
                                    }
                                };

                                xhr.addEventListener('load', function() {
                                    console.log('XHR response received:', this.status);
                                    lastResponseTime = Date.now();
                                    if (this.responseType === '' || this.responseType === 'text') {
                                        try {
                                            const response = JSON.parse(this.responseText);
                                            console.log('XHR response data:', response);
                                            if (response && (response.status === 'success' || response.status === 1)) {
                                                paymentAttempted = true;
                                                console.log('Payment success detected in XHR response');
                                                window.parent.postMessage({
                                                    type: 'paymentSuccess',
                                                    paymentId,
                                                    timestamp: Date.now()
                                                }, '*');
                                            }
                                        } catch (e) {
                                            console.log('Non-JSON response:', this.responseText.substring(0, 200));
                                        }
                                    }
                                });

                                xhr.addEventListener('error', function(error) {
                                    console.error('XHR error:', error);
                                    window.parent.postMessage({
                                        type: 'paymentError',
                                        error: 'Network request failed',
                                        paymentId
                                    }, '*');
                                });

                                return xhr;
                            };

                            // Monitor payment completion indicators
                            const observer = new MutationObserver((mutations) => {
                                for (const mutation of mutations) {
                                    if (mutation.type === 'childList' || mutation.type === 'characterData') {
                                        const content = document.body.textContent;
                                        if (content.includes(&apos;payment successful&apos;) || 
                                            content.includes(&apos;transaction completed&apos;) ||
                                            content.includes(&apos;thank you for your payment&apos;)) {
                                            console.log(&apos;Payment success detected in content&apos;);
                                            window.parent.postMessage({
                                                type: &apos;paymentSuccess&apos;,
                                                paymentId,
                                                timestamp: Date.now()
                                            }, &apos;*&apos;);
                                        }
                                        if (content.includes(&apos;payment failed&apos;) || 
                                            content.includes(&apos;transaction failed&apos;) ||
                                            content.includes(&apos;payment error&apos;)) {
                                            console.log(&apos;Payment failure detected in content&apos;);
                                            window.parent.postMessage({
                                                type: &apos;paymentFailure&apos;,
                                                paymentId,
                                                timestamp: Date.now()
                                            }, &apos;*&apos;);
                                        }
                                    }
                                }
                            });

                            observer.observe(document.body, {
                                childList: true,
                                characterData: true,
                                subtree: true
                            });
                        })();
                    `;

                    iframeDoc.body.appendChild(script);
                    console.log('Monitoring script injected successfully');
                } catch (error) {
                    console.error('Error injecting monitoring script:', error);
                }
            };

            iframe.addEventListener('load', handleLoad);
            
            // Cleanup
            return () => {
                URL.revokeObjectURL(blobUrl);
                iframe.removeEventListener('load', handleLoad);
            };
        } catch (error) {
            console.error('Error setting up iframe:', error);
        }
    }, [paymentPageContent, paymentState.id]);

    // Handle iframe messages with more debugging
    useEffect(() => {
        const handleMessage = async (event) => {
            console.log('Received message from iframe:', event.data);
            
            const { type, paymentId } = event.data;
            
            if (!paymentId || paymentId !== paymentState.id) {
                console.log('Ignoring message for different payment ID');
                return;
            }

            try {
                switch (type) {
                    case 'paymentSuccess':
                        console.log('Payment success received');
                        const verified = await verifyPayment(paymentId);
                        if (verified) {
                            setStatus('Payment verified successfully');
                            await handleStoreSubscriber(paymentId);
                        }
                        break;
                        
                    case 'paymentError':
                        console.log('Payment error received:', event.data.error);
                        setError(`Payment processing error: ${event.data.error}`);
                        break;
                        
                    case 'paymentFailure':
                        console.log('Payment failure received');
                        setError('Payment failed. Please try again.');
                        break;
                }
            } catch (error) {
                console.error('Error handling payment message:', error);
                setError('Error processing payment. Please try again.');
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [paymentState.id]);

    return (
        <div className="payment-container">
            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={() => setError(null)}>Dismiss</button>
                </div>
            )}
            
            {status && (
                <div className="status-message">
                    {status}
                </div>
            )}
            
            <button 
                onClick={handlePaymentRequest} 
                disabled={loading || paymentState.verifying}
            >
                {loading ? 'Loading...' : 'Make Payment'}
            </button>
            
            {paymentPageContent && (
                <iframe
                    ref={iframeRef}
                    className="payment-iframe"
                    sandbox="allow-scripts allow-forms allow-same-origin"
                    style={{ 
                        width: '100%', 
                        height: '600px', 
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                />
            )}
        </div>
    );
}