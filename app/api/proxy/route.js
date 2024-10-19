// // app/api/proxy/route.js
// import axios from 'axios';
// import { NextResponse } from 'next/server';

// export async function GET(request) {
//     return handleProxyRequest(request);
// }

// export async function POST(request) {
//     return handleProxyRequest(request);
// }

// // Helper function to handle the proxy logic
// async function handleProxyRequest(request) {
//     try {
//         const url = new URL(request.url);
//         const paymentUrl = url.searchParams.get('url');  // Get the payment URL from the query parameter
//         const method = url.searchParams.get('method') || 'GET';  // Get the request method (default to GET)

//         if (!paymentUrl) {
//             return NextResponse.json({ error: 'Missing payment URL' }, { status: 400 });
//         }

//         // Step 1: Make the initial GET request to capture XSRF-TOKEN and cookies
//         const initialResponse = await axios({
//             method: 'GET',
//             url: paymentUrl,  // Payment provider URL from the query parameter
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
//                 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
//                 'Referer': 'http://localhost:3000/',
//             },
//             withCredentials: true,  // Ensure cookies are sent back
//         });

//         // Step 2: Extract cookies and XSRF token from the initial response headers
//         const setCookieHeader = initialResponse.headers['set-cookie'] || [];
//         const xsrfToken = extractXsrfToken(setCookieHeader);  // Extract XSRF-TOKEN from cookies
//         const sessionCookies = setCookieHeader.join('; ');  // Combine cookies into a single string

//         // Step 3: Return the HTML content directly for the iframe to render

//         const headers = new Headers({
//             'Content-Type': 'text/html',
//             'Referrer-Policy': 'no-referrer-when-downgrade',
//         });

//         initialResponse.headers['x-frame-options'] = undefined;  // Remove x-frame-options header
//         initialResponse.headers['content-security-policy'] = undefined;  // Remove content-security-policy header

//         // Copy all other headers from the initial response
//         for (const [key, value] of Object.entries(initialResponse.headers)) {
//             if (key.toLowerCase() !== 'x-frame-options' && key.toLowerCase() !== 'content-security-policy') {
//                 headers.append(key, value);
//             }
//         }
//         return new Response(initialResponse.data, {headers: headers});
//     } catch (error) {
//         console.error('Error fetching payment page:', error);
//         return NextResponse.json({ error: 'Failed to fetch payment page' }, { status: 500 });
//     }
// }

// // Helper function to extract XSRF-TOKEN from set-cookie header
// function extractXsrfToken(setCookieHeader) {
//     const xsrfTokenCookie = setCookieHeader.find(cookie => cookie.startsWith('XSRF-TOKEN='));
//     if (!xsrfTokenCookie) return null;
//     return decodeURIComponent(xsrfTokenCookie.split(';')[0].split('=')[1]);  // Extract and decode XSRF-TOKEN
// }
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

        if (!targetUrl) {
            return NextResponse.json({ error: 'Missing target URL' }, { status: 400 });
        }

        console.log('Proxying request to:', targetUrl);

        const proxyResponse = await axios({
            method: request.method,
            url: targetUrl,
            headers: {
                ...Object.fromEntries(request.headers),
                'Host': new URL(targetUrl).host,
                'Referer': targetUrl,
            },
            data: ['POST', 'PUT', 'PATCH'].includes(request.method) ? await request.text() : undefined,
            responseType: 'arraybuffer',
            validateStatus: () => true,
        });

        console.log('Proxy response status:', proxyResponse.status);
        console.log('Proxy response content-type:', proxyResponse.headers['content-type']);

        const contentType = proxyResponse.headers['content-type'];
        let body = proxyResponse.data;

        if (contentType && (contentType.includes('text/html') || contentType.includes('application/json') || contentType.includes('text/javascript'))) {
            body = body.toString('utf-8');
            body = rewriteUrls(body, targetUrl, request.url);
            console.log('Rewritten content length:', body.length);
        }

        const headers = new Headers();
        for (const [key, value] of Object.entries(proxyResponse.headers)) {
            if (key.toLowerCase() !== 'x-frame-options' && key.toLowerCase() !== 'content-security-policy') {
                headers.append(key, value);
            }
        }

        // Set a very permissive Content-Security-Policy
        headers.set('Content-Security-Policy', "default-src * data: blob: 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';");

        // Allow CORS
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        headers.set('Access-Control-Allow-Headers', '*');

        return new Response(body, {
            status: proxyResponse.status,
            headers: headers,
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Proxy request failed', details: error.message }, { status: 500 });
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