'use client';

import { useState } from 'react';

export default function TestSubscriber() {
    const [token, setToken] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [tokenData, setTokenData] = useState(null);

    const verifyToken = async () => {
        try {
            setError(null);
            setResult(null);
            setTokenData(null);

            // First verify the token
            const verifyResponse = await fetch('/api/verify-payment-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, action: 'verify' })
            });

            if (!verifyResponse.ok) {
                throw new Error('Token verification failed:', );
            }

            const data = await verifyResponse.json();
            console.log('Token verification response:', data);
            setTokenData(data.data);
        } catch (err) {
            setError(err.message);
            console.error('Verification error:', err);
        }
    };

    const storeSubscriber = async () => {
        try {
            setError(null);
            setResult(null);

            if (!tokenData) {
                throw new Error('Please verify token first');
            }

            console.log('Storing subscriber with data:', {
                user_id: tokenData.user_id,
                creator_id: tokenData.creator_id
            });

            const storeResponse = await fetch('/api/store-subscriber', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: tokenData.user_id,
                    creator_id: tokenData.creator_id
                })
            });

            if (!storeResponse.ok) {
                const errorData = await storeResponse.json();
                throw new Error('Store failed: ' + JSON.stringify(errorData));
            }

            const data = await storeResponse.json();
            console.log('Store response:', data);
            setResult(data);
        } catch (err) {
            setError(err.message);
            console.error('Store error:', err);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Test Subscriber Storage</h1>
            
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">JWT Token:</label>
                <textarea 
                    className="w-full p-2 border rounded"
                    rows="4"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste JWT token here"
                />
            </div>

            <div className="flex gap-2 mb-4">
                <button
                    onClick={verifyToken}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    1. Verify Token
                </button>
                <button
                    onClick={storeSubscriber}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    2. Store Subscriber
                </button>
            </div>

            {tokenData && (
                <div className="mb-4 p-4 bg-gray-100 rounded">
                    <h2 className="font-bold mb-2">Token Data:</h2>
                    <pre className="whitespace-pre-wrap">
                        {JSON.stringify(tokenData, null, 2)}
                    </pre>
                </div>
            )}

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                    <h2 className="font-bold mb-2">Error:</h2>
                    {error}
                </div>
            )}

            {result && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
                    <h2 className="font-bold mb-2">Success:</h2>
                    <pre className="whitespace-pre-wrap">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
