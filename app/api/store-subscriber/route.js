import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

const PLATFORM_FEE = 0.25; // 25% platform fee (20% platform + 5% processing)

export async function POST(req) {
    const cookieStore = cookies()
    const supabase = createServiceClient(cookieStore)

    const { user_id, creator_id } = await req.json();

    console.log('Storing subscriber:', { user_id, creator_id });

    try {
        // Get creator's tiers data
        const { data: creator, error: creatorError } = await supabase
            .from('creators_page')
            .select('tiers')
            .eq('username', creator_id)
            .single();

        if (creatorError) {
            console.error('Error fetching creator tier:', creatorError);
            throw creatorError;
        }

        if (!creator) {
            console.error('Creator not found for username:', creator_id);
            return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
        }

        if (!creator?.tiers) {
            throw new Error('Creator tiers not set');
        }

        console.log('Creator tiers:', creator.tiers);

        // Get the price from the first tier
        const subscriptionPrice = typeof creator.tiers === 'string'
            ? JSON.parse(creator.tiers)[0].price
            : creator.tiers[0].price;
        if (!subscriptionPrice) {
            throw new Error('Creator tier price not set');
        }
        const tierId = typeof creator.tiers === 'string'
            ? JSON.parse(creator.tiers)[0].name
            : creator.tiers[0].name;
        console.log('Tier price:', subscriptionPrice);

        // First check if there's already an active subscription
        const { data: existingSubs, error: checkError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('telegram_user_id', user_id)
            .eq('creator_id', creator_id)
            .eq('status', 'active')
            .gte('expiration_date', new Date().toISOString());

        if (checkError) {
            console.error('Error checking existing subscription:', checkError);
            throw checkError;
        }

        if (existingSubs && existingSubs.length > 0) {
            console.log('Found existing active subscription:', existingSubs[0]);
            return NextResponse.json({
                message: 'Subscription already exists',
                subscription: existingSubs[0]
            });
        }

        // First, update the subscription request
        const { error: requestError } = await supabase
            .from('subscription_requests')
            .update({
                status: 'active',
            })
            .eq('creator_id', creator_id)
            .eq('user_id', user_id);

        if (requestError) {
            console.error('Error updating subscription request:', requestError);
            throw requestError;
        }

        // Then, create a new subscription
        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + 1); // 1 month subscription

        const { data: subscription, error: subscriptionError } = await supabase
            .from('subscriptions')
            .upsert({
                telegram_user_id: user_id,
                creator_id: creator_id,
                status: 'active',
                created_at: new Date().toISOString(),
                expiration_date: expirationDate.toISOString()
            })
            .select()
            .single();;

        if (subscriptionError) {
            console.error('Error creating subscription:', subscriptionError);
            throw subscriptionError;
        }

        console.log('Created new subscription:', subscription);

        // Create revenue event for the subscription
        const creatorShare = subscriptionPrice * (1 - PLATFORM_FEE);
        const { error: revenueError } = await supabase
            .from('revenue_events')
            .insert({
                creator_id: creator_id,
                subscriber_id: user_id,
                tier_id: tierId,
                amount: subscriptionPrice,
                creator_share: creatorShare,
                platform_fee: subscriptionPrice * PLATFORM_FEE,
                event_type: 'subscription',
                status: 'available',
                created_at: new Date().toISOString(),
                // subscription_id: subscription.id,
                metadata: {
                    subscriber_id: user_id,
                    subscription_id: subscription.id,
                    subscription_period: '1 month',
                    tier_price: subscriptionPrice
                }
            });

        if (revenueError) {
            console.error('Error creating revenue event:', revenueError);
            throw revenueError;
        }

        // Start onboarding process
        const onboardingResult = await onBoarding(creator_id, user_id, supabase);
        console.log('Onboarding result:', onboardingResult);

        return NextResponse.json({
            success: true,
            subscription: subscription,
            onboarding: onboardingResult
        });
    } catch (error) {
        console.error('Error storing subscriber:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function onBoarding(creator_id, user_id, supabase) {
    try {
        const { data: creator, error } = await supabase
            .from('creators_page')
            .select('*')
            .eq('username', creator_id)
            .single();
        if (error) {
            console.error('Error fetching creator:', error);
            return { success: false, error: error.message };
        }

        if (!creator) {
            console.error('Creator not found for username:', creator_id);
            return { success: false, error: 'Creator not found' };
        }

        const creatorGroupId = creator.telegram_group_id;
        if (!creatorGroupId) {
            console.error('No creator group id found');
            return { success: false, error: 'No creator group id found' };
        }

        const inviteLink = await createInviteLink(creatorGroupId);
        if (!inviteLink) {
            console.error('Failed to create invite link');
            return { success: false, error: 'Failed to create invite link' };
        }

        const messageText = `You have successfully subscribed to ${creator.username}! Click the link below to join the group:\n${inviteLink}`;
        const messageSent = await sendMessage(user_id, messageText);

        return {
            success: true,
            inviteLink: inviteLink,
            messageSent: messageSent
        };
    } catch (error) {
        console.error('Error in onboarding:', error);
        return { success: false, error: error.message };
    }
}

const createInviteLink = async (group_id) => {
    try {
        const botToken = process.env.BOT_TOKEN;
        const baseUrl = `https://api.telegram.org/bot${botToken}`;
        const expirationTimestamp = Math.floor(Date.now() / 1000) + 30 * 60;  // 30 minutes from now
        const response = await fetch(`${baseUrl}/createChatInviteLink`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: group_id,
                expire_date: expirationTimestamp,
                member_limit: 1,  // One-time use
            }),
        });
        const data = await response.json();

        if (data.ok) {
            return data.result.invite_link;
        } else {
            console.error('Error creating invite link:', data);
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

const sendMessage = async (user_id, message) => {
    try {
        const botToken = process.env.BOT_TOKEN;
        const baseUrl = `https://api.telegram.org/bot${botToken}`;
        const response = await fetch(`${baseUrl}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: user_id,
                text: message,
            }),
        });
        const data = await response.json();

        if (data.ok) {
            return data.result;
        } else {
            console.error('Error sending message:', data);
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}