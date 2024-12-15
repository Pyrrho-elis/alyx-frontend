'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AutomatedPayment from '../components/AutomatedPayment';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {useCreator} from '@/app/hooks/useCreator';

export default function TestPayPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [avatar_url, setAvatarUrl] = useState(null);

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

    const { creator, loading: creatorLoading, error: creatorError } = useCreator({
        username: userData?.creator_id || null,
    });

    useEffect(() => {
        if (creator) {
            setAvatarUrl(creator.avatar_url);
        }
    }, [creator]);

    if (loading || creatorLoading) {
        return (
            <div className="min-h-screen flex w-full items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-700">Verifying payment token...</h2>
                </div>
            </div>
        );
    }

    if (error || creatorError) {
        return (
            <div className="min-h-screen flex w-full items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
                    <div className="text-center">
                        <div className="mb-4 text-red-500">
                            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Error: {error}</h2>
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Return Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen flex w-full items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
                    <div className="text-center">
                        <div className="mb-4 text-gray-400">
                            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">No user data found</h2>
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Return Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex w-full flex-col items-center justify-center p-4 bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-blue-600 p-6 text-white">
                    <h1 className="text-2xl font-bold text-center">
                        Telebirr Payment
                    </h1>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center justify-center mb-4">
                            <Avatar className="w-32 h-32">
                                <AvatarImage src={`https://cbaoknlorxoueainhdxq.supabase.co/storage/v1/object/public/avatars/${avatar_url}`} alt={`${userData.creator_id}'s avatar`} />
                                <AvatarFallback>{userData?.creator_id?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            {/* <img 
                                src="/telebirr-logo.png" 
                                alt="Telebirr Logo" 
                                className="h-12 w-auto"
                            /> */}
                        </div>
                        <div className="text-center text-gray-600 mb-6">
                            <p className="mb-2">Subscribing to</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {userData.creator_id}'s Community
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <AutomatedPayment
                            userId={userData.user_id}
                            creatorId={userData.creator_id}
                            token={token}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}