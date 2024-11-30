'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminWithdrawals() {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const fetchWithdrawals = async () => {
        try {
            const response = await fetch('/api/admin/withdrawals');
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    router.push('/');
                }
                throw new Error(data.error || 'Failed to fetch withdrawals');
            }

            setWithdrawals(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            if (err.message.includes('Unauthorized')) {
                router.push('/');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (withdrawalId, action) => {
        try {
            const response = await fetch('/api/analytics/withdraw', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    withdrawal_id: withdrawalId,
                    action,
                    admin_id: 'system' // Since we verify admin status through RLS
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to process withdrawal');
            }

            // Refresh the list
            await fetchWithdrawals();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Withdrawal Requests</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {withdrawals.map((withdrawal) => (
                            <tr key={withdrawal.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {withdrawal.user.username}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {withdrawal.user.email}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        ${withdrawal.amount?.toFixed(2)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                          withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                          'bg-red-100 text-red-800'}`}>
                                        {withdrawal.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(withdrawal.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {withdrawal.status === 'pending' && (
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => handleAction(withdrawal.id, 'approve')}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(withdrawal.id, 'reject')}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
