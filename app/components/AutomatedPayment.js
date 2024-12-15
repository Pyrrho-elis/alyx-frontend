'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

export default function AutomatedPayment({ userId, creatorId, token }) {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/automated-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone_number: phoneNumber,
                    user_id: userId,
                    creator_id: creatorId,
                    token: token
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Payment failed');
            }

            // Redirect to success page
            router.push('/payment-success');

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                    </label>
                    <Input
                        id="phone"
                        type="tel"
                        pattern="09[0-9]{8}"
                        placeholder="09********"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                        disabled={loading}
                    />
                </div>

                {error && (
                    <div className="text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {loading ? 'Processing Payment...' : 'Pay Now'}
                </button>
            </form>
        </div>
    );
}
