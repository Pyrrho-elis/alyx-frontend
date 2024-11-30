import { NextResponse } from 'next/server';
import { createAdminClient } from '@/app/utils/supabase/middleware';

const PLATFORM_FEE_PERCENTAGE = 0.25; // 25%

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const creator_id = searchParams.get('creator_id');
        const supabase = createAdminClient();

        if (!creator_id) {
            return NextResponse.json({ error: 'Creator ID is required' }, { status: 400 });
        }

        // Get all revenue events
        const { data: events, error: eventsError } = await supabase
            .from('revenue_events')
            .select('*')
            .eq('creator_id', creator_id)
            .order('created_at', { ascending: false });

        if (eventsError) throw eventsError;

        // Calculate various metrics
        const metrics = calculateRevenueMetrics(events);

        // Get pending withdrawal amount
        const { data: pendingWithdrawal, error: pendingError } = await supabase
            .from('withdrawals')
            .select('amount')
            .eq('creator_id', creator_id)
            .eq('status', 'pending')
            .single();

        if (pendingError && pendingError.code !== 'PGRST116') { // PGRST116 means no rows returned
            throw pendingError;
        }

        // Calculate monthly revenue
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthlyRevenue = events
            .filter(event => new Date(event.created_at) >= firstDayOfMonth)
            .reduce((sum, event) => sum + event.creator_share, 0);

        // Get recent transactions (last 10)
        const recentTransactions = events
            .slice(0, 10)
            .map(event => ({
                id: event.id,
                amount: parseFloat(event.creator_share || 0),
                event_type: event.type || 'subscription',
                status: event.status || 'completed',
                created_at: event.created_at,
                creator_share: parseFloat(event.creator_share || 0)
            }));

        return NextResponse.json({
            total_revenue: metrics.totalRevenue,
            available_balance: metrics.availableBalance,
            pending_balance: metrics.pendingBalance,
            withdrawn_amount: metrics.withdrawnAmount,
            pending_withdrawal: pendingWithdrawal?.amount || 0,
            monthly_revenue: monthlyRevenue,
            recent_transactions: recentTransactions,
            transactions: events.map(event => ({
                ...event,
                creator_share: parseFloat(event.creator_share || 0),
                type: event.type || 'subscription'
            }))
        });
    } catch (error) {
        console.error('Revenue calculation error:', error);
        return NextResponse.json({ error: 'Failed to calculate revenue' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();
        const { creator_id, subscriber_id, tier_id, amount } = body;

        if (!creator_id || !subscriber_id || !tier_id || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const platform_fee = amount * PLATFORM_FEE_PERCENTAGE;
        const creator_share = amount - platform_fee;

        // Create new revenue event
        const { data, error } = await supabase
            .from('revenue_events')
            .insert({
                creator_id,
                subscriber_id,
                tier_id,
                amount,
                platform_fee,
                creator_share,
                event_type: 'subscription',
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Revenue event creation error:', error);
        return NextResponse.json({ error: 'Failed to create revenue event' }, { status: 500 });
    }
}

function calculateRevenueMetrics(events) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    return {
        totalRevenue: events.reduce((sum, event) => 
            event.event_type !== 'refund' ? sum + event.creator_share : sum - event.creator_share, 0),
        
        availableBalance: events.reduce((sum, event) => 
            event.status === 'available' ? sum + event.creator_share : sum, 0),
        
        pendingBalance: events.reduce((sum, event) => 
            event.status === 'pending' ? sum + event.creator_share : sum, 0),
        
        withdrawnAmount: events.reduce((sum, event) => 
            event.status === 'withdrawn' ? sum + event.creator_share : sum, 0),
        
        monthlyRevenue: events
            .filter(event => new Date(event.created_at) >= thirtyDaysAgo)
            .reduce((sum, event) => 
                event.event_type !== 'refund' ? sum + event.creator_share : sum - event.creator_share, 0),
        
        subscriberCount: new Set(
            events
                .filter(event => event.status !== 'refunded')
                .map(event => event.subscriber_id)
        ).size,
        
        revenueByTier: events.reduce((acc, event) => {
            if (!acc[event.tier_id]) {
                acc[event.tier_id] = 0;
            }
            acc[event.tier_id] += event.creator_share;
            return acc;
        }, {}),
        
        recentTransactions: events
            .filter(event => event.status !== 'refunded')
            .slice(0, 10) // Last 10 transactions
    };
}
