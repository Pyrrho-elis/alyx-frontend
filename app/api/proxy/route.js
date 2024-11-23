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
        if (typeof content === 'string' && response.headers['content-type']?.includes('text/html')) {
            content = rewriteUrls(content, targetUrl, request.url);
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