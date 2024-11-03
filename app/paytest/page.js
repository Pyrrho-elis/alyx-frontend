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
    // const user_id = searchParams.get('user_id');
    // const creator_id = searchParams.get('creator_id');
    // const first_name = searchParams.get('first_name');
    // const { user_id, creator_id, phone_number, first_name, last_name } = useParams();
    // const { user_id, creator_id, first_name } = router.query;
    const iframeRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [paymentPageContent, setPaymentPageContent] = useState('');




    const handleTip = async () => {
        setLoading(true);

        try {
            const payResponse = await fetch('/api/pay', {
                method: 'POST',
            });

            if (payResponse.ok) {
                const { redirectUrl } = await payResponse.json();
                console.log('Redirect URL:', redirectUrl);
                const proxyUrl = `/api/proxy?url=${encodeURIComponent(redirectUrl)}`;

                const proxyResponse = await fetch(proxyUrl);
                if (proxyResponse.ok) {
                    const content = await proxyResponse.text();
                    // console.log('Received content length:', content.length);
                    setPaymentPageContent(content);
                } else {
                    console.error('Proxy response not OK:', proxyResponse.status);
                    // alert('Failed to load payment page.');
                }
            } else {
                console.error('Pay response not OK:', payResponse.status);
                // alert('Failed to get payment link.');
            }
        } catch (error) {
            console.error('Error during payment:', error);
            // alert('An error occurred while processing the payment.');
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
        // console.log('Payment response:', response);
        // if (response.status === 1) { // Assuming 1 is the success status
        //     // Close iframe
        //     setPaymentPageContent('');
        //     // Store user (you'll implement this part)
        //     // storeUser(response.user);
        //     // Redirect to success page
        //     handleStoreSubscriber();
        //     alert('Success!');
        //     router.push('/success');
        // } else if (response.status === 0) {
        //     // Transaction is pending
        //     console.log('Transaction is pending. Please wait.');
        // } else if (response.status === 2) {
        //     // Transaction failed or other status
        //     alert(`Payment failed: ${response.message}`);
        // }
    };

    useEffect(() => {
        if (paymentPageContent && iframeRef.current) {
            const iframe = iframeRef.current;
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            // Inject script to override fetch and XMLHttpRequest
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
                                    // Report the response data to the parent window
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

            // Now write the content
            iframeDoc.open();
            iframeDoc.write(paymentPageContent);
            iframeDoc.close();

            // Add event listener to intercept form submissions
            iframe.contentWindow.addEventListener('submit', (event) => {
                // ... (previous form submission code remains the same)
            });

            // Add event listener for messages from the iframe
            window.addEventListener('message', (event) => {
                if (event.data.type === 'paymentResponse') {
                    handlePaymentResponse(event.data.data);
                }
            });
        }
    }, [paymentPageContent]);

    useEffect(() => {
        const handleTokenVerification = async () => {
            if (token) {
                try {

                } catch (error) {

                }
                // Verify token and get user data
                console.log('Verifying token...');
                const response = await fetch(`/api/verify-payment-token?`, {
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
            }
        }
        handleTokenVerification();
        // handleTip()
    }, [token]);

    if (error) {
        return <div>Error: {error}</div>
    }

    useEffect(() => {
        const initiateHandleTip = () => {
            if (userData === token && paymentPageContent === "") {
                handleTip();
            }
        };
        initiateHandleTip();
    }, [userData, token, paymentPageContent])

    // if (userData == token && paymentPageContent == "") { 
    //     handleTip()
    // }

    // if (userData == "loading") {
    //     return <div>Loading...</div>
    // } else {
    //     handleTip()
    // }

    return (
        <div className='w-full h-full'>
            {/* <h1>Tip Pyrrho</h1>
            <div>
                Subscriber Info
                {userData && <p>User ID: {userData}</p>}
                {status && <p>Status: {status}</p>}
            </div>
            <button onClick={handleTip} disabled={loading}>
                {loading ? 'Processing...' : 'Give Tip'}
            </button> */}

            {paymentPageContent && (
                <div className='w-full h-screen'>
                    {/* <h2>Payment Page:</h2> */}
                    <iframe
                        ref={iframeRef}
                        style={{ width: '100%', height: '100%', border: '1px solid #ccc' }}
                        sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                    />
                </div>
            )}

            {!paymentPageContent && <p>Loading...</p>}
        </div>
    );
}