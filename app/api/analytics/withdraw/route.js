import { NextResponse } from 'next/server';
import { createAdminClient } from '@/app/utils/supabase/middleware';

export async function POST(request) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();
        const { creator_id, amount } = body;

        if (!creator_id || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check for existing pending withdrawal
        const { data: existingWithdrawal, error: existingError } = await supabase
            .from('withdrawals')
            .select('id, amount')
            .eq('creator_id', creator_id)
            .eq('status', 'pending')
            .single();

        if (existingError && existingError.code !== 'PGRST116') {
            throw existingError;
        }

        if (existingWithdrawal) {
            return NextResponse.json({ 
                error: 'You already have a pending withdrawal request',
                pending_amount: existingWithdrawal.amount
            }, { status: 400 });
        }

        // Calculate available balance directly
        const { data: revenueEvents, error: balanceError } = await supabase
            .from('revenue_events')
            .select('creator_share')
            .eq('creator_id', creator_id)
            .eq('status', 'available');

        if (balanceError) throw balanceError;

        const availableBalance = revenueEvents?.reduce((sum, event) => sum + event.creator_share, 0) || 0;

        if (availableBalance < amount) {
            return NextResponse.json({ 
                error: 'Insufficient available balance' 
            }, { status: 400 });
        }

        // Create withdrawal record as pending
        const { data: withdrawal, error: withdrawalError } = await supabase
            .from('withdrawals')
            .insert({
                creator_id: creator_id,
                amount,
                status: 'pending',
                created_at: new Date().toISOString(),
                completed_at: null
            })
            .select()
            .single();

        if (withdrawalError) throw withdrawalError;

        // Update revenue events status to 'pending_withdrawal'
        const { error: updateError } = await supabase
            .from('revenue_events')
            .update({ 
                status: 'pending_withdrawal',
                withdrawal_id: withdrawal.id
            })
            .eq('creator_id', creator_id)
            .eq('status', 'available')
            .order('created_at', { ascending: true })
            .limit(amount);

        if (updateError) throw updateError;

        return NextResponse.json(withdrawal);
    } catch (error) {
        console.error('Withdrawal creation error:', error);
        return NextResponse.json({ error: 'Failed to process withdrawal' }, { status: 500 });
    }
}

// Admin endpoint to approve/reject withdrawals
export async function PUT(request) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();
        const { withdrawal_id, action, admin_id } = body;

        if (!withdrawal_id || !action || !admin_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (action !== 'approve' && action !== 'reject') {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Get the withdrawal record
        const { data: withdrawal, error: getError } = await supabase
            .from('withdrawals')
            .select('*')
            .eq('id', withdrawal_id)
            .single();

        if (getError) throw getError;
        if (!withdrawal) {
            return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
        }

        if (withdrawal.status !== 'pending') {
            return NextResponse.json({ 
                error: 'Withdrawal has already been processed' 
            }, { status: 400 });
        }

        if (action === 'approve') {
            // Update withdrawal status to completed
            const { error: updateWithdrawalError } = await supabase
                .from('withdrawals')
                .update({ 
                    status: 'completed',
                    completed_at: new Date().toISOString()
                })
                .eq('id', withdrawal_id);

            if (updateWithdrawalError) throw updateWithdrawalError;

            // Update revenue events status to withdrawn
            const { error: updateEventsError } = await supabase
                .from('revenue_events')
                .update({ status: 'withdrawn' })
                .eq('withdrawal_id', withdrawal_id)
                .eq('status', 'pending_withdrawal');

            if (updateEventsError) throw updateEventsError;
        } else {
            // Reject the withdrawal
            const { error: rejectError } = await supabase
                .from('withdrawals')
                .update({ 
                    status: 'rejected',
                    completed_at: new Date().toISOString()
                })
                .eq('id', withdrawal_id);

            if (rejectError) throw rejectError;

            // Return revenue events to available status
            const { error: updateEventsError } = await supabase
                .from('revenue_events')
                .update({ 
                    status: 'available',
                    withdrawal_id: null
                })
                .eq('withdrawal_id', withdrawal_id)
                .eq('status', 'pending_withdrawal');

            if (updateEventsError) throw updateEventsError;
        }

        return NextResponse.json({ 
            message: `Withdrawal ${action}d successfully` 
        });
    } catch (error) {
        console.error('Withdrawal approval error:', error);
        return NextResponse.json({ 
            error: 'Failed to process withdrawal approval' 
        }, { status: 500 });
    }
}
