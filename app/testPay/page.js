'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AutomatedPayment from '../components/AutomatedPayment';

export default function TestPayPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    console.log(token);

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setError('Payment token is required');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/verify-payment-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token,
                        action: 'verify'
                    })
                });

                if (!response.ok) {
                    throw new Error('Invalid payment token');
                }

                const data = await response.json();
                setUserData(data.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex w-full items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-4">Verifying payment token...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex w-full items-center justify-center">
                <div className="text-center text-red-600">
                    <h2 className="text-xl font-semibold mb-4">Error: {error}</h2>
                    <button 
                        onClick={() => router.push('/')}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen flex w-full items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-4">No user data found</h2>
                    <button 
                        onClick={() => router.push('/')}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex w-full flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-2xl font-bold text-center mb-6">
                    Test Payment Page
                </h1>
                
                <div className="mb-6 text-center">
                    <p className="text-gray-600">
                        <strong>User ID:</strong> {userData.user_id}<br />
                        <strong>Creator ID:</strong> {userData.creator_id}
                    </p>
                </div>

                <AutomatedPayment 
                    userId={userData.user_id} 
                    creatorId={userData.creator_id} 
                    token={token}
                />
            </div>
        </div>
    );
}
