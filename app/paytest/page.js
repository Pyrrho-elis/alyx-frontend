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

    // Effect for iframe content
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

    // Effect for token verification
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

    // Effect for initiating tip
    useEffect(() => {
        if (userData === token && paymentPageContent === "") {
            console.log(token)
            handleTip(token);
        }
    }, [userData, token, paymentPageContent]);

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

        // Prevent dev tools
        const preventDevTools = () => {
            // Detect dev tools
            const devtools = /./;
            devtools.toString = function() {
                preventDevTools();
                return '';
            }
            console.log('%c', devtools);
        };

        // Start monitoring
        preventDevTools();
        setInterval(preventDevTools, 100);

        // Prevent right click
        const preventRightClick = (e) => {
            e.preventDefault();
            return false;
        };

        // Prevent keyboard shortcuts
        const preventKeyShortcuts = (e) => {
            if (
                e.keyCode === 123 || // F12
                (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
                (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
                (e.ctrlKey && e.shiftKey && e.keyCode === 67) || // Ctrl+Shift+C
                (e.metaKey && e.altKey && e.keyCode === 73) || // Cmd+Alt+I
                (e.metaKey && e.altKey && e.keyCode === 74) // Cmd+Alt+J
            ) {
                e.preventDefault();
                return false;
            }
        };

        document.addEventListener('contextmenu', preventRightClick);
        document.addEventListener('keydown', preventKeyShortcuts);

        return () => {
            document.removeEventListener('contextmenu', preventRightClick);
            document.removeEventListener('keydown', preventKeyShortcuts);
        };
    }, []);

    return (
        <div className="container mx-auto">
            {paymentPageContent && (
                <div className='w-full h-screen'>
                    <iframe
                        ref={iframeRef}
                        style={{ width: '100%', height: '100%', border: '1px solid #ccc' }}
                        sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-presentation"
                        allow="payment *"
                        referrerPolicy="origin"
                        onLoad={() => {
                            const iframe = iframeRef.current;
                            if (iframe?.contentWindow) {
                                const script = document.createElement('script');
                                script.textContent = `
                                    // Prevent dev tools
                                    const preventDevTools = () => {
                                        const devtools = /./;
                                        devtools.toString = function() {
                                            preventDevTools();
                                            return '';
                                        }
                                        console.log('%c', devtools);
                                    };

                                    // Start monitoring
                                    preventDevTools();
                                    setInterval(preventDevTools, 100);

                                    // Prevent right click
                                    document.addEventListener('contextmenu', (e) => {
                                        e.preventDefault();
                                        return false;
                                    });

                                    // Prevent keyboard shortcuts
                                    document.addEventListener('keydown', (e) => {
                                        if (
                                            e.keyCode === 123 || // F12
                                            (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
                                            (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
                                            (e.ctrlKey && e.shiftKey && e.keyCode === 67) || // Ctrl+Shift+C
                                            (e.metaKey && e.altKey && e.keyCode === 73) || // Cmd+Alt+I
                                            (e.metaKey && e.altKey && e.keyCode === 74) // Cmd+Alt+J
                                        ) {
                                            e.preventDefault();
                                            return false;
                                        }
                                    });
                                `;
                                iframe.contentDocument.head.appendChild(script);
                            }
                        }}
                    />
                </div>
            )}

            {!paymentPageContent && <p>Loading...</p>}
        </div>
    );
}