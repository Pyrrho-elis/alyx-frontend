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

        if (!targetUrl) {
            return NextResponse.json({ error: 'Missing target URL' }, { status: 400 });
        }

        // Allow payment provider domains and common payment processing domains
        const allowedDomains = [
            'ye-buna.com',
            'chapa.co',
            'checkout.chapa.co',
            'api.chapa.co',
            'payment.chapa.co',
            // CDN and resource domains
            'cloudfront.net',
            'd1a85gsjeabvpg.cloudfront.net',
            'fonts.googleapis.com',
            'fonts.gstatic.com',
            'ajax.googleapis.com',
            'cdn.jsdelivr.net',
            'cdnjs.cloudflare.com',
            // Stripe domains
            'stripe.com',
            'r.stripe.com',
            'js.stripe.com',
            'api.stripe.com',
            'm.stripe.com',
            'q.stripe.com'
        ];
        
        const targetDomain = new URL(targetUrl).hostname;
        const isDomainAllowed = allowedDomains.some(domain => 
            targetDomain === domain || targetDomain.endsWith('.' + domain)
        );

        if (!isDomainAllowed) {
            console.log('Blocked domain:', targetDomain);
            console.log('Allowed domains:', allowedDomains);
            return NextResponse.json({ 
                error: 'Invalid payment provider domain', 
                domain: targetDomain,
                allowedDomains: allowedDomains
            }, { status: 403 });
        }

        console.log('Proxying request to:', targetUrl);

        // Add essential headers for payment provider
        const customHeaders = {
            ...Object.fromEntries(request.headers),
            'Host': new URL(targetUrl).host,
            'Origin': new URL(targetUrl).origin,
            'Referer': targetUrl,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };

        // Remove problematic headers
        delete customHeaders['content-length'];
        delete customHeaders['host'];
        delete customHeaders['connection'];

        console.log('Request headers:', customHeaders);

        const proxyResponse = await axios({
            method: request.method,
            url: targetUrl,
            headers: customHeaders,
            data: ['POST', 'PUT', 'PATCH'].includes(request.method) ? await request.text() : undefined,
            responseType: 'arraybuffer',
            validateStatus: () => true,
            timeout: 30000,
            maxRedirects: 5,
            withCredentials: true
        });

        console.log('Proxy response status:', proxyResponse.status);
        console.log('Proxy response headers:', proxyResponse.headers);

        const contentType = proxyResponse.headers['content-type'];
        console.log('Response content type:', contentType);

        let body = proxyResponse.data;

        if (contentType) {
            if (contentType.includes('text/html') || contentType.includes('application/json') || contentType.includes('text/javascript')) {
                body = body.toString('utf-8');
                console.log('Response body preview:', body.substring(0, 200));
                
                // Only rewrite URLs if it's HTML content
                if (contentType.includes('text/html')) {
                    body = rewriteUrls(body, targetUrl, request.url);
                    console.log('Rewritten content preview:', body.substring(0, 200));
                }
                
                // Monitor for payment status indicators
                if (body.includes('payment_success') || 
                    body.includes('transaction_completed') || 
                    body.includes('thank you for your payment')) {
                    console.log('Payment success detected in response');
                }
                if (body.includes('payment_failed') || 
                    body.includes('transaction_failed') || 
                    body.includes('payment error')) {
                    console.log('Payment failure detected in response');
                }
            }
        }

        const headers = new Headers();
        
        // Copy original headers except security headers
        for (const [key, value] of Object.entries(proxyResponse.headers)) {
            if (!['x-frame-options', 'content-security-policy', 'strict-transport-security'].includes(key.toLowerCase())) {
                headers.append(key, value);
            }
        }

        // Set security headers that allow iframe functionality while maintaining some protection
        headers.set('Content-Security-Policy', `
            default-src * data: blob: 'unsafe-inline' 'unsafe-eval';
            script-src * 'unsafe-inline' 'unsafe-eval';
            connect-src * 'unsafe-inline';
            img-src * data: blob: 'unsafe-inline';
            frame-src *;
            style-src * 'unsafe-inline';
        `.replace(/\s+/g, ' ').trim());

        // Allow CORS
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        headers.set('Access-Control-Allow-Headers', '*');
        headers.set('Access-Control-Allow-Credentials', 'true');

        // Add cache control to prevent stale responses
        headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

        // Set content type if not already set
        if (!headers.get('content-type') && contentType) {
            headers.set('content-type', contentType);
        }

        console.log('Final response headers:', Object.fromEntries(headers.entries()));

        return new Response(body, {
            status: proxyResponse.status,
            headers: headers,
        });
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