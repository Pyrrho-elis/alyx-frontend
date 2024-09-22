import { createClient } from '@/app/utils/supabase/server'
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)
        const formData = await req.formData();
        const file = formData.get('file');
        const userId = formData.get('userId');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json({ error: `Upload error: ${uploadError.message}` }, { status: 500 });
        }

        const { error: updateError } = await supabase
            .from('creators_page')
            .update({ avatar_url: filePath })
            .eq('id', userId);

        if (updateError) {
            console.error('Profile update error:', updateError);
            return NextResponse.json({ error: `Profile update error: ${updateError.message}` }, { status: 500 });
        }

        return NextResponse.json({ filePath });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: `Unexpected error: ${error.message}` }, { status: 500 });
    }
}