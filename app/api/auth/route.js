import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { createClient } from '@/app/utils/supabase/server'
import { cookies } from 'next/headers'


const validateAccNo = (accNo) => {
    if (!accNo) return { error: "Error: Account Number is required!" }
    if (! /^1000\d{9}$/.test(accNo.toString())) return { error: "Error: Invalid Account Number!" }
    return accNo.toString().toLowerCase()
}

const validateUsername = (username) => {
    if (!username) return { error: "Error: Username is required!" }
    if (! /^[a-zA-Z0-9_]{3,16}$/.test(username.toString()) || /\s/.test(username)) return { error: "Error: Invalid Username! Username must be 3-16 characters long, contain only letters, numbers, and underscores, and have no spaces." }
    return username.toString().toLowerCase()
}

export async function POST(req) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { email, password, creator_name, acc_no, telegram_group_username, username, type } = await req.json()


        if (type === 'login') {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) {
                return NextResponse.json({ error: error.message }, { status: 400 })
            }
            return NextResponse.json({ session: data.session }, { status: 200 })
        }
        if (type === 'signup') {
            // Validate account number and username
            const accNo = validateAccNo(acc_no); // This may throw an error
            const telegramUsername = validateUsername(telegram_group_username); // This may throw an error
            const creatorUsername = validateUsername(username); // This may throw an error


            if (accNo.error) return NextResponse.json({ error: accNo.error }, { status: 400 });
            if (telegramUsername.error) return NextResponse.json({ error: telegramUsername.error }, { status: 400 });
            if (creatorUsername.error) return NextResponse.json({ error: creatorUsername.error }, { status: 400 });

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        creator_name,
                        acc_no: accNo,
                        telegram_group_username: telegramUsername.toLowerCase(),
                        username: creatorUsername.toLowerCase(),
                    },
                },
            })
            const userId = data.user.id
            const { data: creatorData, error: creatorError } = await supabase
                .from('creators_page')
                .insert({
                    id: userId,
                    title: 'Welcome to the Creator Page',
                    desc: 'This is a test description for the creator page',
                    perks: JSON.stringify([{
                        name: 'Perk 1',
                        description: 'This is a test description for the first benefit'
                    }, {
                        name: 'Perk 2',
                        description: 'This is a test description for the second benefit'
                    }]),
                    username: creatorUsername.toLowerCase(),
                    telegram_group_username: telegramUsername.toLowerCase(),
                    tiers: JSON.stringify([{
                        name: 'Tier 1',
                        price: 1000,
                        description: 'This is a test description for the first tier'
                    }]),
                })
            if (creatorError) {
                return NextResponse.json({ error: creatorError.message }, { status: 400 })
            }
            if (error) {
                return NextResponse.json({ error: error.message }, { status: 400 })
            }
            return NextResponse.json({ session: data.session }, { status: 200 })
        }

        return NextResponse.json({ message: 'Login successful' }, { status: 200 })
    } catch (error) {
        console.error(error)
        // Ensure the error message is returned to the frontend
        return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 400 })
    }
}
