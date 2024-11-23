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
            'stripe.com',
            'js.stripe.com',
            'm.stripe.com',
            'api.stripe.com',
            'checkout.stripe.com',
            'hooks.stripe.com',
            // CDN and resource domains
            'cloudfront.net',
            'd1a85gsjeabvpg.cloudfront.net',
            'fonts.googleapis.com',
            'fonts.gstatic.com',
            'ajax.googleapis.com',
            'cdn.jsdelivr.net',
            'cdnjs.cloudflare.com',
            // Stripe domains
            'r.stripe.com',
            'q.stripe.com',
            'b.stripe.com',
            'payment.chapa.co',
            'chapa.co',
            'checkout.chapa.co',
            'api.chapa.co'
        ];
        
        const targetDomain = new URL(targetUrl).hostname;
        if (!allowedDomains.some(domain => targetDomain.endsWith(domain))) {
            return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
        }

        console.log('Proxying request to:', targetUrl);

        // Create a clean headers object
        let cleanHeaders = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };

        // Special handling for Stripe beacon requests
        const isStripeBeacon = targetUrl.includes('r.stripe.com/b');
        if (isStripeBeacon) {
            // For beacon requests, we want to pass through all headers
            cleanHeaders = Object.fromEntries(request.headers.entries());
        } else {
            // Safely copy headers from the request
            for (const [key, value] of request.headers.entries()) {
                // Skip problematic headers
                if (!['host', 'connection', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
                    try {
                        // Validate header value
                        if (typeof value === 'string' && value.length > 0) {
                            cleanHeaders[key] = value;
                        }
                    } catch (e) {
                        console.warn(`Skipping invalid header: ${key}`);
                    }
                }
            }
        }

        // Add payment provider specific headers
        if (targetDomain.includes('stripe.com')) {
            cleanHeaders['Origin'] = request.headers.get('origin') || 'https://ye-buna.com';
            cleanHeaders['Referer'] = request.headers.get('referer') || 'https://ye-buna.com/';
        }

        // Add target-specific headers
        cleanHeaders['Host'] = new URL(targetUrl).host;
        cleanHeaders['Origin'] = new URL(targetUrl).origin;
        cleanHeaders['Referer'] = targetUrl;

        console.log('Request headers:', cleanHeaders);

        const proxyResponse = await axios({
            method: request.method,
            url: targetUrl,
            headers: cleanHeaders,
            data: ['POST', 'PUT', 'PATCH'].includes(request.method) ? await request.text() : undefined,
            responseType: 'arraybuffer',
            validateStatus: () => true,
            timeout: 30000,
            maxRedirects: 5,
        });

        console.log('Proxy response status:', proxyResponse.status);
        console.log('Proxy response headers:', proxyResponse.headers);

        const contentType = proxyResponse.headers['content-type'] || '';
        
        // If it's HTML content, filter out Stripe scripts
        if (contentType.includes('text/html')) {
            const responseText = proxyResponse.data.toString('utf-8');
            
            // Remove Stripe-related script tags
            const filteredHtml = responseText.replace(
                /<script[^>]*(?:stripe\.com|r\.stripe\.com|js\.stripe\.com)[^>]*>[\s\S]*?<\/script>/gi,
                ''
            );
            
            // Create new response with filtered HTML
            return new NextResponse(filteredHtml, {
                status: proxyResponse.status,
                headers: {
                    'Content-Type': 'text/html;charset=UTF-8',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Credentials': 'true',
                }
            });
        }

        // For non-HTML responses, return as-is
        return new NextResponse(proxyResponse.data, {
            status: proxyResponse.status,
            headers: {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Credentials': 'true',
            }
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