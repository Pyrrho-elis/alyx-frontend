// app/api/proxy/route.js
import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(request) {
    return handleProxyRequest(request);
}

export async function POST(request) {
    return handleProxyRequest(request);
}

export async function PUT(request) {
    return handleProxyRequest(request);
}

export async function DELETE(request) {
    return handleProxyRequest(request);
}

async function handleProxyRequest(request) {
    try {
        const url = new URL(request.url);
        const targetUrl = url.searchParams.get('url') || url.searchParams.get('proxyUrl');
        const paymentData = url.searchParams.get('paymentData') ? 
            JSON.parse(decodeURIComponent(url.searchParams.get('paymentData'))) : 
            null;

        if (!targetUrl) {
            return NextResponse.json({ error: 'Missing target URL' }, { status: 400 });
        }

        // Temporarily allow all domains for testing
        console.log('Proxying request to:', targetUrl);
        const targetDomain = new URL(targetUrl).hostname;
        console.log('Target domain:', targetDomain);

        // Create a clean headers object
        let cleanHeaders = {
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };

        // Copy all headers from the request except sensitive ones
        for (const [key, value] of request.headers.entries()) {
            if (!['host', 'connection', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
                cleanHeaders[key] = value;
            }
        }

        // Add target-specific headers
        cleanHeaders['Host'] = new URL(targetUrl).host;
        cleanHeaders['Origin'] = new URL(targetUrl).origin;

        // Get request method and body
        const method = request.method;
        let body = null;
        if (method !== 'GET' && method !== 'HEAD') {
            body = await request.text();
        }

        console.log('Request headers:', cleanHeaders);
        console.log('Request method:', method);

        // Make the proxied request
        const response = await axios({
            method: method,
            url: targetUrl,
            headers: cleanHeaders,
            data: body,
            maxRedirects: 5,
            validateStatus: null,
        });

        console.log('Proxy response status:', response.status);

        // Create response headers
        const responseHeaders = {
            'Content-Type': response.headers['content-type'] || 'text/plain',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': '*'
        };

        let content = response.data;
        if (typeof content === 'string') {
            if (response.headers['content-type']?.includes('text/html')) {
                content = rewriteUrls(content, targetUrl, request.url);
                
                // If this is ye-buna page and we have payment data, inject our scripts
                if (isYeBunaPage(targetUrl) && paymentData) {
                    content = injectScripts(content, paymentData);
                    
                    // Auto-submit the form after injection
                    content = content.replace('</script>', `
                        // Auto-submit form after filling
                        setTimeout(() => {
                            const form = document.querySelector('form');
                            if (form) {
                                form.submit();
                            }
                        }, 500);
                    </script>`);
                }
                
                // Inject tracking script
                content = injectTrackingScript(content);
            }
        }

        return new NextResponse(
            typeof content === 'string' ? content : JSON.stringify(content),
            {
                status: response.status,
                headers: responseHeaders
            }
        );
    } catch (error) {
        console.error('Proxy error:', error);
        
        // Provide more detailed error information
        const errorResponse = {
            error: 'Proxy request failed',
            details: error.message,
            type: error.name,
            isAxiosError: error.isAxiosError || false,
            url: error.config?.url,
            method: error.config?.method,
        };

        if (error.response) {
            errorResponse.statusCode = error.response.status;
            errorResponse.statusText = error.response.statusText;
            errorResponse.responseHeaders = error.response.headers;
        }

        return NextResponse.json(errorResponse, { 
            status: error.response?.status || 500 
        });
    }
}

function rewriteUrls(content, targetUrl, proxyUrl) {
    const baseUrl = new URL(targetUrl);
    const proxyBaseUrl = new URL(proxyUrl);

    // Rewrite URLs in HTML and JavaScript
    content = content.replace(/((?:href|src|action|url|endpoint)=?["'\s])(https?:\/\/[^"'\s]+)/gi, (match, prefix, url) => {
        const newUrl = `${proxyBaseUrl.origin}${proxyBaseUrl.pathname}?proxyUrl=${encodeURIComponent(url)}`;
        return `${prefix}${newUrl}`;
    });

    // Rewrite relative URLs
    content = content.replace(/((?:href|src|action)=["'])(?!https?:\/\/)([^"']+)/gi, (match, prefix, path) => {
        const absoluteUrl = new URL(path, baseUrl).href;
        const newUrl = `${proxyBaseUrl.origin}${proxyBaseUrl.pathname}?proxyUrl=${encodeURIComponent(absoluteUrl)}`;
        return `${prefix}${newUrl}`;
    });

    return content;
}

// Function to inject our auto-fill and tracking JavaScript
function injectScripts(content, paymentData) {
    // Find the closing </body> tag
    const bodyEnd = content.lastIndexOf('</body>');
    if (bodyEnd === -1) return content;

    const script = `
    <script>
        // Store payment data
        window.__PAYMENT_DATA__ = ${JSON.stringify(paymentData)};

        // Function to fill the ye-buna form
        function fillYeBunaForm() {
            const form = document.querySelector('form');
            if (!form) return;

            // Find amount input and set value
            const amountInput = form.querySelector('input[name="amount"]');
            if (amountInput) {
                amountInput.value = window.__PAYMENT_DATA__.amount;
            }

            // Track form submission
            form.addEventListener('submit', function(e) {
                // Send tracking event
                fetch('/api/pay/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event: 'form_submitted',
                        paymentId: window.__PAYMENT_DATA__.paymentId,
                        amount: window.__PAYMENT_DATA__.amount
                    })
                });
            });
        }

        // Function to track Chapa redirect
        function trackChapaRedirect() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                        const iframe = mutation.target;
                        if (iframe.src.includes('chapa')) {
                            fetch('/api/pay/track', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    event: 'chapa_redirect',
                                    paymentId: window.__PAYMENT_DATA__.paymentId,
                                    chapaUrl: iframe.src
                                })
                            });
                        }
                    }
                });
            });

            // Watch for iframes
            document.querySelectorAll('iframe').forEach(iframe => {
                observer.observe(iframe, { attributes: true });
            });
        }

        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            fillYeBunaForm();
            trackChapaRedirect();
        });
    </script>`;

    return content.slice(0, bodyEnd) + script + content.slice(bodyEnd);
}

function injectTrackingScript(content) {
    const script = `
        <script>
            (function() {
                // Intercept XHR requests
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
                            try {
                                const response = JSON.parse(xhr.response);
                                console.log('Payment Response:', response);
                                if (response.status !== undefined) {
                                    // Send status to our tracking endpoint
                                    fetch('/api/pay/track', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            event: 'payment_status',
                                            status: response.status,
                                            data: response
                                        })
                                    });
                                }
                            } catch (e) {
                                // Not JSON, ignore
                            }
                        });
                        return originalSend.apply(this, arguments);
                    };
                    return xhr;
                };

                // Intercept fetch requests
                const originalFetch = window.fetch;
                window.fetch = function() {
                    console.log('Fetch Request:', ...arguments);
                    return originalFetch.apply(this, arguments)
                        .then(async response => {
                            const clone = response.clone();
                            try {
                                const data = await clone.json();
                                console.log('Payment Response:', data);
                                if (data.status !== undefined) {
                                    // Send status to our tracking endpoint
                                    await fetch('/api/pay/track', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            event: 'payment_status',
                                            status: data.status,
                                            data: data
                                        })
                                    });
                                }
                            } catch (e) {
                                // Not JSON, ignore
                            }
                            return response;
                        });
                };
            })();
        </script>
    `;
    return content.replace('</head>', script + '</head>');
}

// Function to check if this is a ye-buna page
function isYeBunaPage(url) {
    return url.includes('ye-buna.com');
}