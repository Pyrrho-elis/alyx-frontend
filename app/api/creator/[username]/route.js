import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(req, { params }) {
  const { username } = params;
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  console.log(username);

  try {
    const { data: creator, error } = await supabase
      .from('creators_page')
      .select('*')
      .eq('username', username)
      .single();

    if (error) throw error;

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    return NextResponse.json(creator);
  } catch (error) {
    console.error('Error fetching creator:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { username } = params;
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const data = await req.json();
  console.log(data);

  try {
    const { data: updatedCreator, error } = await supabase
      .from('creators_page')
      .update(data)
      .eq('username', username)
      .single();

    if (error) throw error;

    return NextResponse.json(updatedCreator);
  } catch (error) {
    console.error('Error updating creator:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}