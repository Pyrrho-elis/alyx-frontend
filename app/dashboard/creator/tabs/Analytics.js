'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/app/hooks/useUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, DollarSign, Users, TrendingUp, Wallet } from 'lucide-react';
import CustomButton from '@/app/components/CustomButton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function Analytics() {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [withdrawing, setWithdrawing] = useState(false);

    useEffect(() => {
        if (user?.user_metadata?.username) {
            fetchAnalytics(user.user_metadata.username);
        }
    }, [user]);

    const fetchAnalytics = async (username) => {
        try {
            const response = await fetch(`/api/analytics/revenue?creator_id=${username}`);
            console.log(`/api/analytics/revenue?creator_id=${username}`)
            if (!response.ok) throw new Error('Failed to fetch analytics');
            const data = await response.json();
            setAnalytics(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (!analytics?.available_balance || !user?.user_metadata?.username) return;
        
        setWithdrawing(true);
        try {
            const response = await fetch('/api/analytics/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creator_id: user.user_metadata.username,
                    amount: analytics.available_balance
                })
            });

            if (!response.ok) throw new Error('Failed to process withdrawal');
            
            // Refresh analytics after withdrawal
            await fetchAnalytics(user.user_metadata.username);
        } catch (error) {
            setError(error.message);
        } finally {
            setWithdrawing(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <Card className="bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-600">Error: {error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Revenue */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${analytics?.total_revenue?.toFixed(2) || '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Lifetime earnings
                        </p>
                    </CardContent>
                </Card>

                {/* Monthly Revenue */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Monthly Revenue
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${analytics?.monthly_revenue?.toFixed(2) || '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Last 30 days
                        </p>
                    </CardContent>
                </Card>

                {/* Available Balance */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Available Balance
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${analytics?.available_balance?.toFixed(2) || '0.00'}
                        </div>
                        <CustomButton 
                            onClick={handleWithdraw}
                            disabled={!analytics?.available_balance || withdrawing}
                            className="mt-2"
                            size="sm"
                        >
                            {withdrawing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Withdraw'
                            )}
                        </CustomButton>
                    </CardContent>
                </Card>

                {/* Subscriber Count */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Subscribers
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analytics?.subscriber_count || '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Current members
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analytics?.recent_transactions?.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>
                                        {new Date(transaction.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        {transaction.event_type}
                                    </TableCell>
                                    <TableCell>
                                        ${transaction.creator_share?.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        {transaction.status}
                                    </TableCell>
                                </TableRow>
                            )) || (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        No transactions yet
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
