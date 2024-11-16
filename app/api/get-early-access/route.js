import { NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { cookies } from 'next/headers'


export async function POST(request) {
    try {
        const { email } = await request.json()
        
        // Initialize Supabase client
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        // Insert email into waitlist table
        const { error } = await supabase
            .from('waitlist')
            .insert([{ email }])

        if (error) throw error

        return NextResponse.json({ message: 'Successfully joined waitlist' })
    } catch (error) {
        console.error('Error adding to waitlist:', error)
        return NextResponse.json(
            { error: 'Failed to join waitlist' },
            { status: 500 }
        )
    }
}
