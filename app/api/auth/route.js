import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { createClient } from '@/app/utils/supabase/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Create a Supabase client with service role for admin operations
const createAdminClient = (cookieStore) => {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            cookies: {
                get: (name) => cookieStore.get(name)?.value,
                set: (name, value, options) => cookieStore.set(name, value, options),
                remove: (name, options) => cookieStore.set(name, '', options),
            },
        }
    )
}

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

        const { email, password, creator_name, username, type } = await req.json()
        console.log(email, password, creator_name, username, type)


        if (type === 'login') {
            console.log("logging in")
            // Use regular client for initial login
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) {
                console.error('Login error:', error);
                return NextResponse.json({ error: error.message }, { 
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            }

            // Use admin client to check if user should be admin
            const adminClient = createAdminClient(cookieStore)
            
            // Get current user metadata
            const { data: { user: currentUser }, error: getUserError } = await adminClient.auth.admin.getUserById(data.user.id)
            
            if (getUserError) {
                console.error('Error getting user:', getUserError);
                return NextResponse.json({ error: getUserError.message }, { 
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            }

            // Only update metadata if needed (e.g., if user is an admin but metadata doesn't reflect it)
            const isAdmin = email === 'naolm75@gmail.com' // Replace with your admin email
            if (isAdmin && !currentUser.user_metadata?.is_admin) {
                const { error: updateError } = await adminClient.auth.admin.updateUserById(
                    data.user.id,
                    {
                        user_metadata: {
                            ...currentUser.user_metadata,
                            is_admin: true
                        }
                    }
                )

                if (updateError) {
                    console.error('Error updating user metadata:', updateError);
                } else {
                    console.log('Successfully updated user metadata');
                }

                // Sign in again to get fresh session
                const { data: refreshedSession, error: refreshError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })

                if (refreshError) {
                    console.error('Error refreshing session:', refreshError);
                    return NextResponse.json({ error: refreshError.message }, { 
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                }

                return NextResponse.json({ session: refreshedSession.session }, { 
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            }

            // If no updates needed, return original session
            return NextResponse.json({ session: data.session }, { 
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }
        if (type === 'signup') {
            // Validate account number and username
            // const accNo = validateAccNo(acc_no); // This may throw an error
            // const telegramUsername = validateUsername(telegram_group_username); // This may throw an error
            const creatorUsername = validateUsername(username); // This may throw an error


            // if (accNo.error) return NextResponse.json({ error: accNo.error }, { status: 400 });
            // if (telegramUsername.error) return NextResponse.json({ error: telegramUsername.error }, { status: 400 });
            if (creatorUsername.error) return NextResponse.json({ error: creatorUsername.error }, { status: 400 });

            const { data, error } = await supabase.auth.signUp(
                {
                    email,
                    password,
                    options: {
                        data: {
                            creator_name: creator_name,
                            username: creatorUsername.toLowerCase(),
                        },
                    }
                })
            console.log(data)
            const userId = data.user.id
            const { Cdata: creatorData, error: creatorError } = await supabase
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
                    // telegram_group_username: telegramUsername.toLowerCase(),
                    tiers: JSON.stringify([{ "name": "Tier 1", "price": 1000, "description": "This is a test description for the first tier" }]),
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
