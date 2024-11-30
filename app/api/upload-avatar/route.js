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

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Verify the creator record exists before attempting upload
        const { data: creator, error: creatorError } = await supabase
            .from('creators_page')
            .select('id')
            .eq('id', userId)
            .single();

        if (creatorError || !creator) {
            console.error('Creator verification error:', creatorError);
            return NextResponse.json({ 
                error: 'Creator not found or unauthorized',
                details: creatorError?.message 
            }, { status: 404 });
        }

        // Clean up old avatar if it exists
        const { data: oldAvatar } = await supabase
            .from('creators_page')
            .select('avatar_url')
            .eq('id', userId)
            .single();

        if (oldAvatar?.avatar_url) {
            const oldPath = oldAvatar.avatar_url.split('/').pop();
            await supabase.storage
                .from('avatars')
                .remove([`avatars/${oldPath}`]);
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json({ 
                error: 'Failed to upload avatar',
                details: uploadError.message 
            }, { status: 500 });
        }

        const { error: updateError } = await supabase
            .from('creators_page')
            .update({ 
                avatar_url: filePath,
            })
            .eq('id', userId);

        if (updateError) {
            console.error('Profile update error:', updateError);
            // If update fails, clean up the uploaded file
            await supabase.storage
                .from('avatars')
                .remove([filePath]);
                
            return NextResponse.json({ 
                error: 'Failed to update profile',
                details: updateError.message 
            }, { status: 500 });
        }

        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(filePath);

        return NextResponse.json({ 
            success: true,
            filePath,
            publicUrl,
            message: 'Avatar updated successfully'
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ 
            error: 'Unexpected error occurred',
            details: error.message 
        }, { status: 500 });
    }
}