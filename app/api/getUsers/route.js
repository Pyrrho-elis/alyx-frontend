import { createClient } from '@/app/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'

export async function GET() {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

  const { data: creators } = await supabase.from('creators').select()

  return NextResponse.json(creators)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { name, email, password } = await req.json()

        const hashedPassword = await bcrypt.hash(password, 10)

        const { data, error } = await supabase.from('creators').insert([{ name, email, password: hashedPassword }])

        return NextResponse.json(data)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
